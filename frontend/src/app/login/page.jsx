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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(() => {
    if (searchParams?.get('expired')) return 'Your session has expired. Please sign in again.';
    if (searchParams?.get('error')) return 'Google sign-in was cancelled or could not be completed. Please try again.';
    return '';
  });
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session?.accessToken) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

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
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  // Show loading while checking auth status
  if (status === 'loading') {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      </div>
    );
  }

  // Don't render form if already authenticated (redirect will happen)
  if (status === 'authenticated' && session?.accessToken) {
    return null;
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <HardDrive size={28} style={{ fill: 'rgba(15, 82, 186, 0.1)' }} />
            <span>DocVault</span>
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Securely manage and access your digital files</p>
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
              placeholder="name@company.com"
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

        <button
          type="button"
          className="btn btn-secondary btn-full"
          style={{ marginTop: '12px' }}
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          Continue with Google
        </button>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link href="/register" className="auth-link">
            Create Account
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
