"use client";

import React from 'react';
import Link from 'next/link';
import { HardDrive, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>Terms of Service</h1>
        <p style={{ color: '#666', marginBottom: '40px' }}>Last updated: August 11, 2026</p>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>1. Acceptance of Terms</h2>
          <p style={{ marginBottom: '16px' }}>
            By creating an account, accessing, or using DocVault ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>2. Description of Service</h2>
          <p style={{ marginBottom: '16px' }}>
            DocVault is a cloud-based web application (SaaS) designed to allow users to securely store, organize, and share digital documents and files. The Service includes file storage, generation of shareable links, and basic file management capabilities.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>3. User Accounts and Responsibilities</h2>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>You must provide accurate and complete registration information.</li>
            <li style={{ marginBottom: '8px' }}>You are entirely responsible for maintaining the confidentiality of your account credentials (password).</li>
            <li style={{ marginBottom: '8px' }}>You agree to notify us immediately of any unauthorized use of your account.</li>
            <li style={{ marginBottom: '8px' }}>You retain all ownership rights to the files you upload, but you are solely responsible for their content.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>4. Acceptable Use Policy</h2>
          <p style={{ marginBottom: '16px' }}>You agree NOT to use DocVault to:</p>
          <ul style={{ paddingLeft: '20px', marginBottom: '16px' }}>
            <li style={{ marginBottom: '8px' }}>Upload, store, or share any content that is illegal, abusive, harassing, or promotes violence.</li>
            <li style={{ marginBottom: '8px' }}>Upload malware, viruses, or any code designed to disrupt the Service or other users' devices.</li>
            <li style={{ marginBottom: '8px' }}>Infringe on the intellectual property rights of others (e.g., storing pirated materials).</li>
            <li style={{ marginBottom: '8px' }}>Attempt to bypass or exploit the Service's security mechanisms or limits.</li>
          </ul>
          <p>Violation of this policy may result in immediate account suspension or termination.</p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>5. Intellectual Property Rights</h2>
          <p style={{ marginBottom: '16px' }}>
            DocVault claims no intellectual property rights over the material you provide to the Service. The Service itself, including its original content, features, design, and functionality, are and will remain the exclusive property of DocVault and its licensors.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>6. Termination of Accounts</h2>
          <p style={{ marginBottom: '16px' }}>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms. You may also permanently delete your account at any time via your Profile settings.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>7. Disclaimers and Limitation of Liability</h2>
          <p style={{ marginBottom: '16px' }}>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. DocVault makes no warranties, whether express or implied, regarding the reliability or availability of the Service. In no event shall DocVault be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or use.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>8. Governing Law</h2>
          <p style={{ marginBottom: '16px' }}>
            These Terms shall be governed and construed in accordance with the laws of the applicable jurisdiction, without regard to its conflict of law provisions.
          </p>
        </section>
        
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>9. Changes to Terms</h2>
          <p style={{ marginBottom: '16px' }}>
            We reserve the right to modify or replace these Terms at any time. We will provide notice of any significant changes. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', color: '#111' }}>10. Contact Us</h2>
          <p style={{ marginBottom: '16px' }}>
            If you have any questions about these Terms, please contact us at: <br />
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
