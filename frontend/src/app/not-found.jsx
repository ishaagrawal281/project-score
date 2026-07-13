"use client";

import React from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: 'var(--bg-page)', 
      padding: '24px',
      fontFamily: 'var(--font-sans)'
    }}>
      <HelpCircle size={64} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center', maxWidth: '360px' }}>
        The path you are looking for does not exist or has been relocated.
      </p>
      <Link href="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
