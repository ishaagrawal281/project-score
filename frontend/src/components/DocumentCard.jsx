"use client";

import React from 'react';
import { FileText, FileImage, File, Share2, Trash2, Download, Move } from 'lucide-react';

/**
 * Format bytes to readable size string.
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Extract absolute file link. Handles local storage fallback base paths.
 */
export const getAbsoluteFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const apiBase = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) || 'http://localhost:5000/api';
  const serverBase = apiBase.replace('/api', '');
  return `${serverBase}${url}`;
};

const DocumentCard = ({ doc, onShare, onDelete, onMove }) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(doc.fileType.toLowerCase()) || 
                  /\.(jpg|jpeg|png)$/i.test(doc.filename);
  const isPdf = doc.fileType.includes('pdf') || /\.pdf$/i.test(doc.filename);
  const isDocx = doc.fileType.includes('word') || 
                 doc.fileType.includes('officedocument.wordprocessingml') || 
                 /\.docx$/i.test(doc.filename);

  const getFileIcon = () => {
    if (isPdf) {
      return (
        <div className="doc-icon-wrap doc-icon-pdf">
          <FileText size={28} />
        </div>
      );
    }
    if (isImage) {
      return (
        <div className="doc-icon-wrap doc-icon-image">
          <FileImage size={28} />
        </div>
      );
    }
    if (isDocx) {
      return (
        <div className="doc-icon-wrap doc-icon-word">
          <FileText size={28} />
        </div>
      );
    }
    return (
      <div className="doc-icon-wrap doc-icon-other">
        <File size={28} />
      </div>
    );
  };

  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const fileUrl = getAbsoluteFileUrl(doc.cloudUrl);

  return (
    <div className="doc-card">
      <div className="doc-preview-placeholder">
        {getFileIcon()}
      </div>
      
      <div className="doc-details">
        <span className="doc-filename" title={doc.filename}>{doc.filename}</span>
        <div className="doc-meta">
          <span>{uploadDate}</span>
          <span>{formatBytes(doc.size)}</span>
        </div>
      </div>

      <div className="doc-actions">
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="doc-btn" 
          title="Download File"
          download={doc.filename}
        >
          <Download size={16} />
        </a>
        <button 
          onClick={() => onShare(doc)} 
          className="doc-btn" 
          title="Generate Share Link"
        >
          <Share2 size={16} />
        </button>
        <button 
          onClick={() => onMove(doc)} 
          className="doc-btn" 
          title="Move File"
        >
          <Move size={16} />
        </button>
        <button 
          onClick={() => onDelete(doc)} 
          className="doc-btn doc-btn-danger" 
          title="Delete File"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
