"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useSession } from 'next-auth/react';
import { HardDrive, AlertTriangle, Loader } from 'lucide-react';

const Register = () => {
  const { signup } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await signup(name, email, password);
      router.push('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
  if (status === 'authenticated') {
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
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Get started with secure cloud storage</p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger" style={{ marginBottom: '24px' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="your.email@example.com"
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
              placeholder="At least 6 characters"
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
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link href="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
