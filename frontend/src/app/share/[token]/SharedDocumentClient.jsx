/**
 * ============================================================================
 *  SharedDocumentClient — Client Component for Share Page Interactivity
 * ============================================================================
 *
 *  CONCEPT: Server-Side Rendering (System & Integration)
 *
 *  This is the CLIENT component of the SSR share page architecture:
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │  SERVER COMPONENT (page.jsx)                                      │
 *  │  - Runs on the server at request time                             │
 *  │  - Fetches document data from backend API via server-side fetch   │
 *  │  - Renders HTML with document data embedded                       │
 *  │  - Sends fully-rendered HTML to the browser (no loading spinner)  │
 *  │  - Passes data as props to this client component                  │
 *  └──────────────────────┬───────────────────────────────────────────┘
 *                         │ Props (doc, expiresAt)
 *  ┌──────────────────────▼───────────────────────────────────────────┐
 *  │  CLIENT COMPONENT (SharedDocumentClient.jsx) — THIS FILE          │
 *  │  - Runs in the browser                                            │
 *  │  - Handles interactive elements (download button, timer)          │
 *  │  - Hydrates the server-rendered HTML                              │
 *  │  - Can use React hooks (useState, useEffect, onClick handlers)    │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 *  WHY SPLIT INTO SERVER + CLIENT COMPONENTS?
 *  - Server: Data fetching is faster (no client-side network waterfall)
 *  - Server: HTML is complete on first load (better SEO, faster FCP)
 *  - Client: Interactive features (event handlers) require JavaScript
 *  - Next.js App Router makes this split natural and efficient
 *
 * ============================================================================
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Download, FileText, FileImage, File, Clock, HardDrive } from 'lucide-react';
import { forceDownload } from '../../../utils/downloadHelper';

/**
 * Format bytes to human-readable string (duplicated here for client-side use).
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}

/**
 * Get absolute file URL (handles relative local paths and absolute cloud URLs).
 */
function getAbsoluteFileUrl(cloudUrl) {
  if (!cloudUrl) return '';
  if (cloudUrl.startsWith('http://') || cloudUrl.startsWith('https://')) return cloudUrl;
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  return `${backend}${cloudUrl}`;
}

/**
 * SharedDocumentClient — Interactive client component for the SSR share page.
 *
 * Receives document data as props from the server component parent.
 * Handles download button clicks and renders document previews.
 *
 * @param {Object} props
 * @param {Object} props.doc - Document metadata (filename, cloudUrl, fileType, size)
 * @param {string} props.expiresAt - ISO timestamp of link expiration
 */
export default function SharedDocumentClient({ doc, expiresAt }) {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(doc.fileType.toLowerCase()) ||
                  /\.(jpg|jpeg|png)$/i.test(doc.filename);
  const isPdf = doc.fileType.includes('pdf') || /\.pdf$/i.test(doc.filename);
  const isDocx = doc.fileType.includes('word') ||
                 doc.fileType.includes('officedocument.wordprocessingml') ||
                 /\.docx$/i.test(doc.filename);

  const fileUrl = getAbsoluteFileUrl(doc.cloudUrl);
  const expiryDate = new Date(expiresAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  /**
   * Handle file download — this is an interactive action that requires
   * client-side JavaScript (onClick handler), which is why it must be
   * in a 'use client' component rather than the server component.
   */
  const handleDownload = () => {
    forceDownload(fileUrl, doc.filename);
  };

  return (
    <div className="shared-layout">
      <nav className="shared-nav">
        <div className="nav-brand">
          <HardDrive size={24} style={{ color: 'var(--primary)' }} />
          <span>DocVault</span>
        </div>
      </nav>

      <div className="shared-content">
        <div className="shared-card">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            {isPdf ? (
              <div className="doc-icon-wrap doc-icon-pdf"><FileText size={32} /></div>
            ) : isImage ? (
              <div className="doc-icon-wrap doc-icon-image"><FileImage size={32} /></div>
            ) : (
              <div className="doc-icon-wrap doc-icon-other"><File size={32} /></div>
            )}
          </div>

          <h2
            style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '6px',
              color: 'var(--text-main)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'center'
            }}
            title={doc.filename}
          >
            {doc.filename}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', textAlign: 'center' }}>
            File Size: {formatBytes(doc.size)}
          </p>

          {/* Media Previews */}
          {isImage && (
            <div className="shared-preview-box" style={{ padding: '8px' }}>
              <img
                src={fileUrl}
                alt={doc.filename}
                style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          )}

          {isPdf && (
            <div className="shared-preview-box" style={{ padding: '0px' }}>
              <iframe
                src={fileUrl}
                title={doc.filename}
                className="shared-preview-frame"
                style={{ border: 'none', height: '350px' }}
              ></iframe>
            </div>
          )}

          {isDocx && (
            <div className="shared-preview-box" style={{ padding: '32px 16px', borderStyle: 'dashed' }}>
              <FileText size={40} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Word Document preview is not supported. Please download to view.
              </p>
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#9a3412',
            margin: '20px 0 28px 0',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#fff7ed',
            border: '1px solid #ffedd5'
          }}>
            <Clock size={16} style={{ flexShrink: 0 }} />
            <span>Link expires on: {expiryDate}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleDownload}
              className="btn btn-primary"
              style={{ padding: '12px 32px' }}
            >
              <Download size={16} />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
