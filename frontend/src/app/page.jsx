'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  HardDrive,
  ShieldCheck,
  UploadCloud,
  Clock,
  Search,
  Layers,
  Lock,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Share2,
  Sparkles,
  Zap,
  KeyRound,
  Github,
  Mail
} from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = status === 'authenticated' && !!session;

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Background ambient lighting effects */}
      <div className="landing-glow-top" />
      <div className="landing-glow-bottom" />

      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <Link href="/" className="landing-brand">
            <div className="nav-brand-icon-wrap" style={{ width: '38px', height: '38px' }}>
              <HardDrive size={22} />
            </div>
            <span>DocVault</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className={`landing-nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <a
              href="#home"
              className="landing-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#features"
              className="landing-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="landing-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a
              href="#why-choose-us"
              className="landing-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Why Choose Us
            </a>

            {/* Mobile Auth Button */}
            {mobileMenuOpen && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handlePrimaryAction();
                }}
                className="btn btn-primary btn-full"
                style={{ marginTop: '12px' }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Login / Sign Up'}
              </button>
            )}
          </div>

          {/* Desktop Right Actions */}
          <div className="landing-nav-actions">
            <button onClick={handlePrimaryAction} className="btn btn-primary">
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Login / Sign Up'}</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-badge">
            <Sparkles size={14} />
            <span>DigiLocker-Inspired Document Vault</span>
          </div>

          <h1 className="landing-hero-title">
            Your Secure <span className="landing-hero-title-highlight">Digital Document</span> Vault
          </h1>

          <p className="landing-hero-subtitle">
            Securely upload, organize, manage, and share your most important documents from anywhere with bank-grade encryption, instant search, and expiring guest links.
          </p>

          <div className="landing-hero-buttons">
            <button onClick={handlePrimaryAction} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started'}</span>
              <ArrowRight size={18} />
            </button>
            <a href="#features" className="btn btn-secondary" style={{ padding: '14px 24px', fontSize: '15px' }}>
              Learn More
            </a>
          </div>

          <div className="landing-hero-trust">
            <div className="landing-trust-item">
              <CheckCircle2 size={16} />
              <span>10 MB File Limit</span>
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={16} />
              <span>Encrypted Storage</span>
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={16} />
              <span>Expiring Links</span>
            </div>
            <div className="landing-trust-item">
              <CheckCircle2 size={16} />
              <span>Infinite Scroll</span>
            </div>
          </div>
        </div>

        {/* Hero Visual / Preview Graphic */}
        <div className="landing-hero-visual">
          {/* Floating Security Badge */}
          <div className="landing-floating-badge landing-floating-badge-top">
            <div className="nav-brand-icon-wrap" style={{ width: '32px', height: '32px', background: 'var(--success-bg)', color: 'var(--success)' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>Secure AES Vault</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bank-grade encryption active</div>
            </div>
          </div>

          {/* Hero Card Container */}
          <div className="landing-hero-card-frame">
            <div className="landing-hero-img-wrap">
              <img
                src="/images/hero-vault.jpg"
                alt="DocVault Secure Storage Graphic"
                className="landing-hero-img"
              />
            </div>
          </div>

          {/* Bottom Floating Badge */}
          <div className="landing-floating-badge landing-floating-badge-bottom">
            <div className="nav-brand-icon-wrap" style={{ width: '32px', height: '32px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--secondary)' }}>Expiring Link Generated</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Valid for 24 hours only</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-badge">POWERFUL FEATURES</span>
          <h2 className="landing-section-title">Everything You Need to Manage Digital Documents</h2>
          <p className="landing-section-subtitle">
            Built with modern architecture to give you full control, lightning-fast file access, and airtight privacy.
          </p>
        </div>

        <div className="landing-features-grid">
          {/* Feature 1 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <ShieldCheck size={26} />
            </div>
            <h3 className="landing-feature-title">Secure Cloud Storage</h3>
            <p className="landing-feature-desc">
              Your files are stored safely with strong access controls and encrypted metadata protection, shielding them against unauthorized access.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <UploadCloud size={26} />
            </div>
            <h3 className="landing-feature-title">Upload Documents up to 10 MB</h3>
            <p className="landing-feature-desc">
              Seamlessly upload PDFs, identity records, financial contracts, images, and docx files up to 10 MB with live progress tracking.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Clock size={26} />
            </div>
            <h3 className="landing-feature-title">Time-Limited Shareable Links</h3>
            <p className="landing-feature-desc">
              Share documents securely with guests or external partners using customizable expiration windows (1h, 24h, 7 days) and view limits.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Search size={26} />
            </div>
            <h3 className="landing-feature-title">Fast Document Search & Organization</h3>
            <p className="landing-feature-desc">
              Organize documents into custom folders and locate files instantly using real-time search, file-type filters, and date range filters.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <Layers size={26} />
            </div>
            <h3 className="landing-feature-title">Infinite Scroll Dashboard</h3>
            <p className="landing-feature-desc">
              Enjoy a fluid, pagination-free browsing experience with dynamic infinite scrolling that loads your document list on demand.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="landing-feature-card">
            <div className="landing-feature-icon">
              <KeyRound size={26} />
            </div>
            <h3 className="landing-feature-title">Secure Authentication</h3>
            <p className="landing-feature-desc">
              Integrated NextAuth authentication offering Google OAuth single sign-on and JWT token protection for enterprise-grade login safety.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="landing-section" style={{ backgroundColor: '#F8F4EF', borderRadius: 'var(--radius-xl)', margin: '40px auto' }}>
        <div className="landing-section-header">
          <span className="landing-section-badge">SIMPLE WORKFLOW</span>
          <h2 className="landing-section-title">How DocVault Works in 4 Easy Steps</h2>
          <p className="landing-section-subtitle">
            Get your digital vault running in seconds without complex configurations or software downloads.
          </p>
        </div>

        <div className="landing-steps-grid">
          {/* Step 1 */}
          <div className="landing-step-card">
            <div className="landing-step-num">01</div>
            <h3 className="landing-step-title">Login or Create an Account</h3>
            <p className="landing-step-desc">
              Create an account or sign in using your email or Google account with a single click.
            </p>
          </div>

          {/* Step 2 */}
          <div className="landing-step-card">
            <div className="landing-step-num">02</div>
            <h3 className="landing-step-title">Upload Your Documents</h3>
            <p className="landing-step-desc">
              Drag and drop or select files up to 10 MB to upload directly into your secure vault.
            </p>
          </div>

          {/* Step 3 */}
          <div className="landing-step-card">
            <div className="landing-step-num">03</div>
            <h3 className="landing-step-title">Organize and Manage Files</h3>
            <p className="landing-step-desc">
              Create folders, tag favorites, rename files, and sort by date or size effortlessly.
            </p>
          </div>

          {/* Step 4 */}
          <div className="landing-step-card">
            <div className="landing-step-num">04</div>
            <h3 className="landing-step-title">Share Securely with Expiring Links</h3>
            <p className="landing-step-desc">
              Generate time-limited shareable URLs so recipients can safely view files before expiry.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-badge">WHY CHOOSE US</span>
          <h2 className="landing-section-title">Built for Speed, Privacy, and Trust</h2>
          <p className="landing-section-subtitle">
            Engineered to replace messy file storage with a reliable, DigiLocker-inspired personal document vault.
          </p>
        </div>

        <div className="landing-why-grid">
          {/* Card 1 */}
          <div className="landing-why-card">
            <div className="landing-why-icon-wrap">
              <ShieldCheck size={28} />
            </div>
            <h3 className="landing-why-title">Secure Storage</h3>
            <p className="landing-why-desc">
              Standard encryption & JWT tokens keep your identity and sensitive documents private.
            </p>
          </div>

          {/* Card 2 */}
          <div className="landing-why-card">
            <div className="landing-why-icon-wrap">
              <Zap size={28} />
            </div>
            <h3 className="landing-why-title">Fast Access</h3>
            <p className="landing-why-desc">
              Sub-second document retrieval and instant search keep your workflow smooth and productive.
            </p>
          </div>

          {/* Card 3 */}
          <div className="landing-why-card">
            <div className="landing-why-icon-wrap">
              <Lock size={28} />
            </div>
            <h3 className="landing-why-title">Privacy Focused</h3>
            <p className="landing-why-desc">
              No tracking, zero unauthorized data sharing, and strict owner permission validation.
            </p>
          </div>

          {/* Card 4 */}
          <div className="landing-why-card">
            <div className="landing-why-icon-wrap">
              <Share2 size={28} />
            </div>
            <h3 className="landing-why-title">Easy Document Sharing</h3>
            <p className="landing-why-desc">
              Send guest links with automatic expiration so you remain in total control of shared files.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="landing-cta-banner">
          <h2 className="landing-cta-title">Ready to Organize Your Digital Documents?</h2>
          <p className="landing-cta-desc">
            Join thousands of users storing and sharing their important files safely on DocVault.
          </p>
          <button onClick={handlePrimaryAction} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
            <span>{isAuthenticated ? 'Open Your Dashboard' : 'Get Started Now'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <div className="landing-footer-brand">
            <div className="landing-brand">
              <div className="nav-brand-icon-wrap" style={{ width: '34px', height: '34px' }}>
                <HardDrive size={20} />
              </div>
              <span>DocVault</span>
            </div>
            <p className="landing-footer-desc">
              Enterprise-grade digital document vault inspired by DigiLocker. Upload, manage, and share your documents securely from anywhere.
            </p>
          </div>

          <div>
            <h4 className="landing-footer-col-title">Navigation</h4>
            <div className="landing-footer-links">
              <a href="#home" className="landing-footer-link">Home</a>
              <a href="#features" className="landing-footer-link">Features</a>
              <a href="#how-it-works" className="landing-footer-link">How It Works</a>
              <a href="#why-choose-us" className="landing-footer-link">Why Choose Us</a>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-col-title">Account</h4>
            <div className="landing-footer-links">
              <Link href="/login" className="landing-footer-link">Login</Link>
              <Link href="/register" className="landing-footer-link">Sign Up</Link>
              <Link href="/dashboard" className="landing-footer-link">Dashboard</Link>
            </div>
          </div>

          <div>
            <h4 className="landing-footer-col-title">Resources & Support</h4>
            <div className="landing-footer-links">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="landing-footer-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Github size={14} />
                <span>GitHub Repository</span>
              </a>
              <a
                href="mailto:support@docvault.app"
                className="landing-footer-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Mail size={14} />
                <span>Contact / Support</span>
              </a>
            </div>
          </div>
        </div>

        <div className="landing-footer-bottom">
          <div>© 2026 DocVault. All rights reserved.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
