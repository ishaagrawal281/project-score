"use client";

import React from 'react';
import { FileText, FileImage, File, Share2, Trash2, Download, Move } from 'lucide-react';

export const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

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
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(doc.fileType?.toLowerCase()) || 
                  /\.(jpg|jpeg|png)$/i.test(doc.filename);
  const isPdf = doc.fileType?.includes('pdf') || /\.pdf$/i.test(doc.filename);
  const isDocx = doc.fileType?.includes('word') || 
                 doc.fileType?.includes('officedocument.wordprocessingml') || 
                 /\.docx$/i.test(doc.filename);

  const getFileIcon = () => {
    if (isPdf) {
      return (
        <div className="doc-icon-wrap doc-icon-pdf">
          <FileText size={26} />
        </div>
      );
    }
    if (isImage) {
      return (
        <div className="doc-icon-wrap doc-icon-image">
          <FileImage size={26} />
        </div>
      );
    }
    if (isDocx) {
      return (
        <div className="doc-icon-wrap doc-icon-word">
          <FileText size={26} />
        </div>
      );
    }
    return (
      <div className="doc-icon-wrap doc-icon-other">
        <File size={26} />
      </div>
    );
  };

  const uploadDate = new Date(doc.uploadedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const fileUrl = getAbsoluteFileUrl(doc.cloudUrl);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = doc.filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="doc-card">
      <div className="doc-preview-placeholder">
        {getFileIcon()}
      </div>
      
      <div className="doc-details">
        <span className="doc-filename" title={doc.filename}>{doc.filename}</span>
        <div className="doc-meta">
          <span>{uploadDate}</span>
          <span style={{ fontWeight: 600 }}>{formatBytes(doc.size)}</span>
        </div>
      </div>

      <div className="doc-actions">
        <button 
          onClick={handleDownload}
          className="doc-btn" 
          title="Download File"
        >
          <Download size={15} />
        </button>
        <button 
          onClick={() => onShare(doc)} 
          className="doc-btn" 
          title="Generate Share Link"
        >
          <Share2 size={15} />
        </button>
        <button 
          onClick={() => onMove(doc)} 
          className="doc-btn" 
          title="Move File"
        >
          <Move size={15} />
        </button>
        <button 
          onClick={() => onDelete(doc)} 
          className="doc-btn doc-btn-danger" 
          title="Delete File"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;
