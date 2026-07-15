"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Download, AlertCircle, HardDrive, FileText, FileImage, File, Clock } from 'lucide-react';
import { formatBytes, getAbsoluteFileUrl } from '../../../components/DocumentCard';

const SharedDocument = () => {
  const { token } = useParams();
  const [doc, setDoc] = useState(null);
  const [expiresAt, setExpiresAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchSharedDoc = async () => {
      if (!token) return;
      try {
        const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        const res = await fetch(`${BACKEND}/api/share/${token}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'This shared link is invalid or has expired.');
        }
        const data = await res.json();
        setDoc(data.document);
        setExpiresAt(data.expiresAt);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'This shared link is invalid or has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchSharedDoc();
  }, [token]);

  if (loading) {
    return (
      <div className="shared-layout">
        <nav className="shared-nav">
          <div className="nav-brand">
            <HardDrive size={24} style={{ fill: 'rgba(15, 82, 186, 0.1)' }} />
            <span>DocVault</span>
          </div>
        </nav>
        <div className="shared-content">
          <div className="skeleton skeleton-card" style={{ width: '100%', maxWidth: '500px', height: '350px' }} />
        </div>
      </div>
    );
  }

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
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>Link Expired</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '14px' }}>{errorMsg}</p>
            <Link href="/login" className="btn btn-primary">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              fontSize: '20px', 
              fontWeight: 700, 
              marginBottom: '4px', 
              color: 'var(--text-main)',
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap' 
            }}
            title={doc.filename}
          >
            {doc.filename}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
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
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary" 
              download={doc.filename}
              style={{ padding: '12px 32px' }}
            >
              <Download size={16} />
              <span>Download File</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedDocument;
