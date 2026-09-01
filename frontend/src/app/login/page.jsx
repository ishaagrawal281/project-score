"use client";

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { signIn, signOut, useSession } from 'next-auth/react';
import { HardDrive, AlertTriangle, Loader } from 'lucide-react';

const LoginContent = () => {
  const { login } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * CLIENT-SIDE ROUTING NOTE: Return-to-intended-page
   *
   * The ?next= query parameter is set by middleware.ts or ProtectedRoute.jsx
   * when redirecting unauthenticated users to /login. After successful login,
   * we redirect to this path instead of always landing on /dashboard.
   */
  const nextUrl = searchParams?.get('next') || '/dashboard';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(() => {
    if (searchParams?.get('expired')) return 'Your session has expired. Please sign in again.';
    if (searchParams?.get('error')) return 'Google sign-in was cancelled or could not be completed. Please try again.';
    return '';
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      router.push(nextUrl);
    }
  }, [status, session, router, nextUrl]);

  useEffect(() => {
    if (session?.error === 'GoogleAccountLinkingFailed') {
      setErrorMsg('We could not finish setting up your Google account. Please try again.');
      signOut({ redirect: false });
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await login(email, password);
      router.push(nextUrl);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    await signIn('google', { callbackUrl: nextUrl }, { prompt: 'select_account' });
  };

  if (status === 'loading') {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '320px' }}>
          <Loader size={36} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.accessToken) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="nav-brand-icon-wrap" style={{ width: '38px', height: '38px' }}>
              <HardDrive size={22} />
            </div>
            <span>DocVault</span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Securely manage and access your digital documents</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>



        <div className="auth-footer">
          Don't have an account?{' '}
          <Link href="/register" className="auth-link">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-container">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
