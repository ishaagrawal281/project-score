"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  return (
    <SessionProvider refetchInterval={5 * 60} session-maxAge={30 * 24 * 60 * 60}>
      <InternalProvider>{children}</InternalProvider>
    </SessionProvider>
  );
};

const InternalProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const value = useMemo(() => {
    return {
      user: session?.user || null,
      token: session?.accessToken || null,
      loading: status === 'loading',
      login: async (email, password) => {
        const res = await signIn('credentials', { redirect: false, email, password });
        if (res?.error) {
          throw new Error(res.error || 'Login failed');
        }
        return res;
      },
      logout: async () => {
        await signOut({ redirect: false });
      },
      signup: async (name, email, password, backendUrl = undefined) => {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${BACKEND}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        // Sign in right after successful registration
        await signIn('credentials', { redirect: false, email, password });
        return data;
      },
      register: async (name, email, password, backendUrl = undefined) => {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${BACKEND}/api/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        // Sign in right after successful registration
        await signIn('credentials', { redirect: false, email, password });
        return data;
      }
    };
  }, [session, status]);

  useEffect(() => {
    if (session?.accessToken) {
      try {
        // Keep legacy clients that read localStorage working, but avoid storing in production by default
        if (process.env.NODE_ENV !== 'production') {
          localStorage.setItem('token', session.accessToken);
        }
      } catch (e) {
        // ignore
      }
    } else {
      try { localStorage.removeItem('token'); } catch (e) {}
    }
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
