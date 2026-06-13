import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/exam'];
// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login', '/register'];
// Public routes
const PUBLIC_ROUTES = ['/', '/verify'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // MVP: Skip auth checks (no Supabase connected yet)
  // In production, check Supabase session cookie:
  //
  // const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() });
  // const { data: { session } } = await supabase.auth.getSession();
  //
  // if (!session && isProtectedRoute(pathname)) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }
  //
  // if (session && isAuthRoute(pathname)) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

  const response = NextResponse.next();

  // Security headers for all routes
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

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
