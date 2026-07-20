"use client";

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { SessionProvider, useSession, signIn, signOut } from 'next-auth/react';
import FetchInterceptor from '../components/FetchInterceptor';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  return (
    <SessionProvider refetchInterval={5 * 60} session-maxAge={30 * 24 * 60 * 60}>
      <FetchInterceptor>
        <InternalProvider>{children}</InternalProvider>
      </FetchInterceptor>
    </SessionProvider>
  );
};

const InternalProvider = ({ children }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.accessToken) {
      console.log('Session loaded with accessToken:', session.accessToken.substring(0, 20) + '...');
    } else if (status !== 'loading') {
      console.log('Session status:', status, 'Token:', session?.accessToken ? 'Present' : 'Missing');
    }
  }, [session, status]);

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
        try {
          const res = await fetch(`${BACKEND}/api/signup`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `Registration failed (${res.status})`);
          }
          
          const data = await res.json();

          // Sign in right after successful registration
          await signIn('credentials', { redirect: false, email, password });
          return data;
        } catch (error) {
          console.error('[AuthContext] Signup error:', error);
          throw error;
        }
      },
      register: async (name, email, password, backendUrl = undefined) => {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';
        try {
          const res = await fetch(`${BACKEND}/api/signup`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, password }),
            credentials: 'include'
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || `Registration failed (${res.status})`);
          }
          
          const data = await res.json();

          // Sign in right after successful registration
          await signIn('credentials', { redirect: false, email, password });
          return data;
        } catch (error) {
          console.error('[AuthContext] Register error:', error);
          throw error;
        }
      }
    };
  }, [session, status]);

  useEffect(() => {
    if (session?.accessToken) {
      try {
        // Always save token to localStorage for client-side access
        localStorage.setItem('token', session.accessToken);
        console.log('[AuthContext] Token saved to localStorage');
      } catch (e) {
        console.log('[AuthContext] Failed to save token to localStorage:', e.message);
      }
    } else {
      try { 
        localStorage.removeItem('token');
        console.log('[AuthContext] Token removed from localStorage');
      } catch (e) {}
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
