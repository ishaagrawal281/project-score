"use client";

import React from 'react';
import Link from 'next/link';
import { HardDrive, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>Privacy Policy</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: August 11, 2026</p>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>1. Introduction</h2>
          <p style={{ marginBottom: '16px' }}>
            Welcome to DocVault. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our web application.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>2. What Data We Collect</h2>
          <p style={{ marginBottom: '16px' }}>We may collect and process the following types of data:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Account Information:</strong> Name, email address, and encrypted passwords when you register.</li>
            <li style={{ marginBottom: '8px' }}><strong>User Content:</strong> The files, documents, and folders you upload to your vault.</li>
            <li style={{ marginBottom: '8px' }}><strong>Usage Data:</strong> Information about how you interact with our application, including access times and feature usage.</li>
            <li style={{ marginBottom: '8px' }}><strong>Device Information:</strong> Browser type, operating system, and IP address for security logging.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>3. How We Use That Data</h2>
          <p style={{ marginBottom: '16px' }}>We use your personal data to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Provide, operate, and maintain the DocVault service.</li>
            <li style={{ marginBottom: '8px' }}>Secure your account and verify your identity upon login.</li>
            <li style={{ marginBottom: '8px' }}>Process and store the documents you choose to upload.</li>
            <li style={{ marginBottom: '8px' }}>Generate secure, temporary share links when requested by you.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>4. Sharing Data with Third Parties</h2>
          <p style={{ marginBottom: '16px' }}>
            We do not sell your personal data. We only share information with trusted third-party service providers necessary to operate our application:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}><strong>Cloud Infrastructure:</strong> Your files are securely hosted using external cloud providers.</li>
            <li style={{ marginBottom: '8px' }}><strong>Database Hosting:</strong> Your account metadata is stored on secure managed database platforms.</li>
          </ul>
          <p>These third parties are bound by strict confidentiality and security obligations.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>5. Data Retention and Deletion</h2>
          <p style={{ marginBottom: '16px' }}>
            We retain your data only for as long as your account is active. You may permanently delete your account and all associated documents at any time from your Profile settings. Upon deletion, your files are immediately purged from our servers and third-party storage.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>6. User Rights</h2>
          <p style={{ marginBottom: '16px' }}>You have the right to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Access and download a copy of the data we hold about you.</li>
            <li style={{ marginBottom: '8px' }}>Request correction of inaccurate or incomplete data.</li>
            <li style={{ marginBottom: '8px' }}>Request complete deletion of your account and files.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>7. Cookies and Tracking</h2>
          <p style={{ marginBottom: '16px' }}>
            DocVault uses essential cookies strictly necessary to keep you securely logged in (e.g., JWT authentication tokens). We do not use third-party tracking cookies or advertising pixels.
          </p>
        </section>
        
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>8. Children's Privacy</h2>
          <p style={{ marginBottom: '16px' }}>
            Our service is not intended for users under the age of 13. We do not knowingly collect personal information from children. If we become aware that we have collected such data, we will take steps to delete it immediately.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>9. Changes to this Policy</h2>
          <p style={{ marginBottom: '16px' }}>
            We may update our Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>10. Contact Us</h2>
          <p style={{ marginBottom: '16px' }}>
            If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at: <br />
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
