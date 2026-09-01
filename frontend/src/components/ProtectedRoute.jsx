"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * CONCEPT: Client-Side Routing — Route Protection Wrapper
 *
 * Second layer of route protection (after middleware.ts). This component
 * wraps protected pages and redirects unauthenticated users to /login.
 *
 * The ?next= query parameter preserves the user's intended destination
 * so that after login they return to the page they originally requested,
 * rather than always landing on /dashboard.
 */
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !token) {
      // Append the current path as ?next= so login can redirect back
      const loginUrl = pathname ? `/login?next=${encodeURIComponent(pathname)}` : '/login';
      router.push(loginUrl);
    }
  }, [token, loading, router, pathname]);

  if (loading || !token) {
    return null; // Don't render content during redirects
  }

  return children;
};

export default ProtectedRoute;

