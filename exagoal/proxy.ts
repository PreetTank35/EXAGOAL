import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Routes that do NOT require authentication
const PUBLIC_ROUTES = ['/', '/login', '/register', '/verify'];
const PUBLIC_API_PREFIXES = ['/api/auth', '/api/otp', '/api/cron', '/api/blockchain', '/api/verify'];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  for (const prefix of PUBLIC_API_PREFIXES) {
    if (pathname.startsWith(prefix)) return true;
  }
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let Next.js static/image/favicon requests pass through
  // (handled by matcher below, but double-check)

  let response = NextResponse.next();

  // ── Security headers for ALL routes ────────────────────────
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // ── Extra security for exam routes ─────────────────────────
  if (pathname.startsWith('/exam')) {
    response.headers.set(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), display-capture=()'
    );
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://openrouter.ai https://*.supabase.co;"
    );
  }

  // ── Public routes: no auth required ────────────────────────
  if (isPublicRoute(pathname)) {
    return response;
  }

  // ── Protected routes: verify Supabase session ──────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Missing env configuration in deployment → redirect to login or 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Server configuration error: Supabase environment variables are missing.' },
        { status: 500 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  let user = null;

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => {
              request.cookies.set(name, value);
            });
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Refresh the session with a 3-second timeout to prevent serverless function hangs
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: new Error('Auth timeout') }), 3000)
    );

    const authResult = await Promise.race([
      supabase.auth.getUser(),
      timeoutPromise,
    ]);

    user = authResult.data?.user;
  } catch (err) {
    console.error('[Proxy] Auth verification error:', err);
  }

  if (!user) {
    // No valid session or auth timed out → redirect to login or return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Teacher route protection ───────────────────────────────
  if (pathname.startsWith('/dashboard/teacher')) {
    const roleCookie = request.cookies.get('exagoal_role')?.value;

    if (!roleCookie || !roleCookie.startsWith('instructor.')) {
      // Not an instructor → redirect to student dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Verify HMAC signature on the role cookie
    const [role, signature] = roleCookie.split('.');
    if (role !== 'instructor' || !signature) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    try {
      const salt = process.env.OTP_SECRET_SALT || 'exagoal_otp_salt_change_in_production';
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(salt),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const expectedSig = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode('instructor')
      );

      const expectedHex = Array.from(new Uint8Array(expectedSig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (signature !== expectedHex) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Re-apply security headers on the potentially new response object
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
