import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next();

  // Security headers for all routes
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  // Role-Based Routing Protection (HMAC-Verified Edge Check)
  if (pathname.startsWith('/dashboard/teacher')) {
    const cookieValue = request.cookies.get('exagoal_role')?.value;

    if (!cookieValue || !cookieValue.includes('.')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const [role, signature] = cookieValue.split('.');
    
    if (role !== 'instructor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Verify the HMAC signature to prevent cookie tampering
    const salt = process.env.OTP_SECRET_SALT || 'exagoal_otp_salt_change_in_production';
    const encoder = new TextEncoder();

    try {
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
        encoder.encode(role)
      );

      const expectedHex = Array.from(new Uint8Array(expectedSig))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      if (signature !== expectedHex) {
        // Cookie was tampered with — redirect to student dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Extra security for exam routes
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
