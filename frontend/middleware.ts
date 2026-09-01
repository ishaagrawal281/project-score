import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

/**
 * CONCEPT: Client-Side Routing — Middleware-Level Access Control
 *
 * Next.js middleware intercepts requests at the edge BEFORE the page component
 * renders. This is the first layer of route protection — it runs on the server
 * and can redirect unauthenticated users before any React code executes.
 *
 * ROUTING RULES:
 * 1. Authenticated users visiting /login or /register → redirect to /dashboard
 * 2. Unauthenticated users visiting protected routes → redirect to /login?next=<path>
 * 3. /share/:token routes are PUBLIC (no auth required) — excluded from matcher
 *
 * The ?next= query parameter preserves the user's intended destination so that
 * after login they land on the page they originally requested, not always /dashboard.
 */
export const middleware = withAuth(
  function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.nextauth.token;

    try {
      // If user is authenticated (has token)
      if (token?.accessToken) {
        // Redirect away from login/register pages to dashboard
        if (pathname === '/login' || pathname === '/register') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }

      // If user is not authenticated
      if (!token?.accessToken) {
        /**
         * CLIENT-SIDE ROUTING NOTE: Return-to-intended-page pattern
         *
         * When bouncing an unauthenticated user to /login, we attach the
         * original path as a ?next= query parameter. The login page reads
         * this param and redirects there after successful authentication,
         * falling back to /dashboard if the param is absent.
         *
         * /share/:token is intentionally EXCLUDED from this check —
         * share links are public endpoints that anonymous visitors must
         * be able to access without authentication.
         */
        const protectedPrefixes = ['/dashboard', '/profile'];
        const isProtected = protectedPrefixes.some(
          (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
        );

        if (isProtected) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('next', pathname);
          return NextResponse.redirect(loginUrl);
        }
      }
    } catch (e) {
      console.error('Middleware URL parsing error:', e);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow all requests - auth check is handled in the middleware function
        return true;
      }
    },
    pages: {
      signIn: '/login',
      error: '/login'
    }
  }
);

/**
 * CONCEPT: Client-Side Routing — Middleware Route Matching
 *
 * The matcher array controls WHICH routes this middleware intercepts.
 * Routes NOT listed here bypass middleware entirely.
 *
 * /share/:path* is intentionally EXCLUDED — share links are public
 * endpoints served by an SSR page (share/[token]/page.jsx) that fetches
 * from the public backend API (GET /api/share/:token, no auth middleware).
 */
export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/login', '/register']
};
