import { withAuth } from 'next-auth/middleware';
import { NextRequest, NextResponse } from 'next/server';

export const middleware = withAuth(
  function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const token = request.nextauth.token;

    // If user is authenticated (has token)
    if (token) {
      // Redirect away from login/register pages to dashboard
      if (pathname === '/login' || pathname === '/register') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // If user is not authenticated
    if (!token) {
      // Redirect to login if accessing protected routes
      if (pathname === '/dashboard' || pathname.startsWith('/share')) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow access to public pages even without token
        return true;
      }
    }
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/share/:path*']
};
