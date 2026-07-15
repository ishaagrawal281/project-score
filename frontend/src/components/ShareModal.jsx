"use client";

import React, { useState } from 'react';
import { X, Clipboard, Check, AlertTriangle } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, doc }) => {
  const [expiry, setExpiry] = useState('24h');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !doc) return null;

  const handleGenerateLink = async () => {
    setLoading(true);
    setErrorMsg('');
    setShareLink('');
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND}/api/share/${doc.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiry })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate share link');
      }
      const data = await res.json();
      
      // Build the absolute frontend shared document URL
      const absoluteUrl = `${window.location.origin}${data.sharePath}`;
      setShareLink(absoluteUrl);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setShareLink('');
    setCopied(false);
    setErrorMsg('');
    setExpiry('24h');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Share Document</h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-medium)', marginBottom: '8px' }}>
            Sharing: <strong style={{ color: 'var(--text-main)' }}>{doc.filename}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {!shareLink ? (
          <>
            <div className="form-group">
              <label className="form-label">Link Expiry Period</label>
              <select 
                className="form-input" 
                value={expiry} 
                onChange={(e) => setExpiry(e.target.value)}
                style={{ appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center/16px', backgroundColor: '#fafbfc' }}
              >
                <option value="10m">10 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="24h">24 Hours</option>
              </select>
            </div>
            
            <button 
              className="btn btn-primary btn-full" 
              onClick={handleGenerateLink}
              disabled={loading}
              style={{ marginTop: '12px' }}
            >
              {loading ? 'Generating...' : 'Generate Secure Link'}
            </button>
          </>
        ) : (
          <div>
            <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>
              Anyone with this secure link can view this document:
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input 
                type="text" 
                className="form-input" 
                readOnly 
                value={shareLink} 
                style={{ backgroundColor: '#f1f5f9', cursor: 'text' }}
                onClick={(e) => e.target.select()}
              />
              <button 
                className="btn btn-primary" 
                onClick={handleCopy}
                style={{ flexShrink: 0, padding: '12px' }}
              >
                {copied ? <Check size={16} /> : <Clipboard size={16} />}
              </button>
            </div>
            {copied && (
              <p style={{ color: 'var(--success)', fontSize: '12px', fontWeight: 600, marginTop: '8px', textAlign: 'left' }}>
                Copied to clipboard!
              </p>
            )}
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', textAlign: 'left' }}>
              Note: This link is single-use/expiring. It will be completely inaccessible after the chosen time.
            </p>
          </div>
        )}

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
