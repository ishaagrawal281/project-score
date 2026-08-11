"use client";

import React from 'react';
import Link from 'next/link';
import { HardDrive, ArrowLeft } from 'lucide-react';

export default function Security() {
  return (
    <div className="legal-page-container" style={{ minHeight: '100vh', backgroundColor: '#F8F4EF' }}>
      <header style={{ padding: '20px 40px', backgroundColor: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#000' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HardDrive size={20} />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>DocVault</span>
        </Link>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: '#666', fontSize: '14px', fontWeight: '500' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', color: '#333', lineHeight: '1.6' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>Security at DocVault</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: August 11, 2026</p>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>1. Our Commitment to Security</h2>
          <p style={{ marginBottom: '16px' }}>
            At DocVault, safeguarding your digital documents is our top priority. We implement robust, enterprise-grade security protocols at every layer of our application to ensure your files remain private, intact, and accessible only to you and those you explicitly authorize.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>2. Data Protection Measures</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Encryption In-Transit:</strong> All data transmitted between your browser and our servers, as well as between our servers and our cloud storage providers, is encrypted using TLS/SSL (HTTPS). This prevents interceptors from reading your data over the network.</li>
            <li style={{ marginBottom: '8px' }}><strong>Encryption At-Rest:</strong> Your files and database metadata are encrypted at rest on our secure cloud infrastructure providers (Cloudinary and Neon Postgres).</li>
            <li style={{ marginBottom: '8px' }}><strong>Secure Token Architecture:</strong> Shareable links are generated using cryptographically secure random bytes, making them impossible to guess.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>3. Account Security</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Password Protection:</strong> We use industry-standard slow-hashing algorithms (`bcrypt`) with salt to encrypt your passwords. We never store or transmit your password in plain text.</li>
            <li style={{ marginBottom: '8px' }}><strong>Strict Password Policies:</strong> We enforce NIST-aligned password policies, requiring a minimum of 8 characters, blocking passwords found in breached datasets, and rejecting passwords containing obvious user information.</li>
            <li style={{ marginBottom: '8px' }}><strong>Session Management:</strong> We use secure JSON Web Tokens (JWT) for authentication. Sessions expire automatically and tokens are invalidated upon logout.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>4. Infrastructure and Compliance</h2>
          <p style={{ marginBottom: '16px' }}>
            DocVault relies on best-in-class infrastructure providers that comply with major security certifications (including SOC 2 and GDPR). 
            We practice strict access control internally; your raw files are never accessed by our team unless explicitly required for support or legal compliance.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>5. Vulnerability Reporting</h2>
          <p style={{ marginBottom: '16px' }}>
            We believe in coordinated disclosure. If you are a security researcher and believe you have found a vulnerability in DocVault, we ask that you report it to us immediately. 
            We pledge to review all reports promptly and act quickly to resolve identified issues.
          </p>
          <p>Please do not exploit the vulnerability or share it publicly until we have had a chance to remediate it.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>6. Incident Response</h2>
          <p style={{ marginBottom: '16px' }}>
            In the highly unlikely event of a data breach or security incident affecting your account, our incident response protocol dictates that we will notify affected users within 72 hours of verification, outlining the scope of the incident and the steps we are taking to secure your data.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>7. Contact Security</h2>
          <p style={{ marginBottom: '16px' }}>
            For urgent security concerns, vulnerability reports, or questions regarding our security practices, please contact our security team directly: <br />
            <strong>Email:</strong> gaurimhetre2007@gmail.com
          </p>
        </section>
      </main>
      
      <footer style={{ padding: '30px', textAlign: 'center', color: '#888', fontSize: '14px', borderTop: '1px solid #eaeaea', backgroundColor: '#fff' }}>
        © {new Date().getFullYear()} DocVault. All rights reserved.
      </footer>
    </div>
  );
}
