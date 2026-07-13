"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

/**
 * Route protector wrapper. Redirects unauthenticated users back to login in Next.js.
 */
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      router.push('/login');
    }
  }, [token, loading, router]);

  if (loading || !token) {
    return null; // Don't render content during redirects
  }

  return children;
};

export default ProtectedRoute;
