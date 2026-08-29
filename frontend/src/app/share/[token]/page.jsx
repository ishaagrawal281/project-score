/**
 * ============================================================================
 *  SHARE PAGE — Server-Side Rendered (SSR) Page Component
 * ============================================================================
 *
 *  CONCEPT: Server-Side Rendering (System & Integration)
 *
 *  This page demonstrates SERVER-SIDE RENDERING (SSR) using Next.js 14
 *  App Router's async server components. The page is rendered on the server
 *  at request time, with document data fetched BEFORE the HTML is sent
 *  to the browser.
 *
 *  SSR vs CSR (Client-Side Rendering) COMPARISON:
 *  ─────────────────────────────────────────────────────────────────────────
 *
 *  CSR (previous implementation with 'use client'):
 *  1. Browser receives empty HTML shell
 *  2. JavaScript bundle downloads and executes
 *  3. React renders a loading spinner
 *  4. Client-side fetch() calls backend API
 *  5. API response arrives → React re-renders with data
 *  → Result: User sees a loading spinner for 2-3 seconds
 *
 *  SSR (this implementation):
 *  1. Server receives the request
 *  2. Server fetches data from backend API (server-to-server, very fast)
 *  3. Server renders the complete HTML with embedded data
 *  4. Browser receives fully rendered HTML with content visible immediately
 *  5. React hydrates the page for interactivity (download button)
 *  → Result: User sees the document immediately, no loading spinner
 *
 *  SSR BENEFITS FOR THIS PAGE:
 *  - FASTER FIRST CONTENTFUL PAINT (FCP): Content is visible immediately
 *  - BETTER SEO: Search engines see the full page content in the HTML
 *  - NO LOADING STATE: The shared document details are in the initial HTML
 *  - REDUCED CLIENT BUNDLE: Data fetching code stays on the server
 *
 *  HOW IT WORKS IN NEXT.JS APP ROUTER:
 *  1. Remove 'use client' directive → makes this a Server Component
 *  2. Export an async function → Next.js knows to render it on the server
 *  3. Use fetch() inside the component → runs on the server (Node.js)
 *  4. Pass data to a Client Component for interactive parts
 *  5. Export generateMetadata() → dynamic SEO tags rendered on the server
 *
 * ============================================================================
 */

import React from 'react';
import Link from 'next/link';
import { AlertCircle, HardDrive } from 'lucide-react';
import SharedDocumentClient from './SharedDocumentClient';

// ─────────────────────────────────────────────────────────────────────────────
//  DYNAMIC METADATA (SSR) — Generate SEO tags on the server
// ─────────────────────────────────────────────────────────────────────────────

/**
 * generateMetadata runs on the SERVER at request time.
 *
 * It fetches the shared document's metadata and generates dynamic
 * <title> and <meta> tags that are embedded in the HTML response.
 *
 * This is an SSR-only feature — with CSR, the meta tags would be generic
 * because the client hasn't fetched the data yet when the HTML is generated.
 *
 * @param {Object} params - Route parameters from the URL
 * @param {string} params.token - The share link token from /share/[token]
 * @returns {Object} Metadata object for Next.js Head
 */
export async function generateMetadata({ params }) {
  const { token } = await params;
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';

  try {
    const res = await fetch(`${BACKEND}/api/share/${token}`, {
      cache: 'no-store' // Always fetch fresh data (no caching for shared links)
    });

    if (!res.ok) {
      return {
        title: 'Shared Document | DocVault',
        description: 'This shared link may have expired or been revoked.'
      };
    }

    const data = await res.json();
    const doc = data.document;

    return {
      title: `${doc.filename} — Shared via DocVault`,
      description: `View and download "${doc.filename}" shared via DocVault. This is a time-limited shared document link.`,
      openGraph: {
        title: `${doc.filename} — Shared via DocVault`,
        description: `View and download "${doc.filename}" shared securely via DocVault.`,
        type: 'website'
      }
    };
  } catch (error) {
    return {
      title: 'Shared Document | DocVault',
      description: 'View a shared document on DocVault.'
    };
  }
}


// ─────────────────────────────────────────────────────────────────────────────
//  SSR PAGE COMPONENT — Async Server Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SharedDocumentPage — Server-Side Rendered async component.
 *
 * THIS FUNCTION RUNS ON THE SERVER, NOT IN THE BROWSER.
 *
 * The `async` keyword is the key indicator — in Next.js App Router,
 * async default exports are treated as Server Components that can
 * perform data fetching directly.
 *
 * Data flow:
 * 1. Request arrives at /share/[token]
 * 2. Next.js calls this function ON THE SERVER
 * 3. We fetch the document data from the Express backend (server-to-server)
 * 4. We render the complete HTML with the document data
 * 5. The HTML is sent to the browser with content already visible
 * 6. SharedDocumentClient (a 'use client' component) hydrates for interactivity
 *
 * @param {Object} props - Next.js page props
 * @param {Promise<Object>} props.params - Route parameters containing the token
 */
export default async function SharedDocumentPage({ params }) {
  const { token } = await params;
  const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';

  // ─── SERVER-SIDE DATA FETCHING ───
  // This fetch() runs in Node.js on the server, NOT in the browser.
  // Benefits:
  // - No CORS issues (server-to-server communication)
  // - Faster response (no client-side network waterfall)
  // - Backend URL can be an internal network address
  // - Data is available BEFORE any HTML is sent to the browser

  let doc = null;
  let expiresAt = null;
  let errorMsg = null;
  let errorType = null; // 'expired' or 'not_found'

  try {
    const res = await fetch(`${BACKEND}/api/share/${token}`, {
      // cache: 'no-store' ensures this page is dynamically rendered
      // on every request (not statically generated at build time).
      // This is essential for share links because:
      // - Link validity changes over time (expiration)
      // - We need real-time status checking
      cache: 'no-store'
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      errorMsg = data.error || 'This shared link is invalid or has expired.';
      errorType = res.status === 410 ? 'expired' : 'not_found';
    } else {
      const data = await res.json();
      doc = data.document;
      expiresAt = data.expiresAt;
    }
  } catch (err) {
    console.error('[SSR] Failed to fetch shared document:', err.message);
    errorMsg = 'Unable to load the shared document. The server may be unavailable.';
    errorType = 'not_found';
  }

  // ─── SERVER-SIDE ERROR RENDERING ───
  // Error states are rendered on the server — the browser receives
  // fully formed error HTML without needing to execute JavaScript.

  if (errorMsg) {
    return (
      <div className="shared-layout">
        <nav className="shared-nav">
          <div className="nav-brand">
            <HardDrive size={24} style={{ fill: 'rgba(15, 82, 186, 0.1)' }} />
            <span>DocVault</span>
          </div>
        </nav>
        <div className="shared-content">
          <div className="shared-card">
            <AlertCircle size={48} style={{ color: 'var(--danger)', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
              {errorType === 'expired' ? 'Link Expired' : 'Link Not Found'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>
              {errorMsg}
            </p>
            <Link href="/login" className="btn btn-primary">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── SERVER-RENDERED SUCCESS STATE ───
  // The document data is passed as props to the Client Component.
  // The Client Component handles interactive features (download button)
  // that require browser JavaScript (onClick handlers).

  return <SharedDocumentClient doc={doc} expiresAt={expiresAt} />;
}
