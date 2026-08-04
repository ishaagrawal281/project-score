"use client";

import React from 'react';
import { FileText, FileImage, File, Eye, Share2, Trash2, Download, Move } from 'lucide-react';
import { formatBytes, getAbsoluteFileUrl } from './DocumentCard';

const DocumentList = ({ documents, onShare, onDelete, onMove, loading, onDocumentClick }) => {
  const getFileIcon = (doc) => {
    const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(doc.fileType?.toLowerCase()) || 
                    /\.(jpg|jpeg|png)$/i.test(doc.filename);
    const isPdf = doc.fileType?.includes('pdf') || /\.pdf$/i.test(doc.filename);
    const isDocx = doc.fileType?.includes('word') || 
                   doc.fileType?.includes('officedocument.wordprocessingml') || 
                   /\.docx$/i.test(doc.filename);

    if (isPdf) {
      return <FileText size={18} style={{ color: '#D9534F' }} />;
    }
    if (isImage) {
      return <FileImage size={18} style={{ color: '#2E7D32' }} />;
    }
    if (isDocx) {
      return <FileText size={18} style={{ color: '#D09367' }} />;
    }
    return <File size={18} style={{ color: '#8C857B' }} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = (doc) => {
    const fileUrl = getAbsoluteFileUrl(doc.cloudUrl);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = doc.filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="documents-table-wrapper">
      <table className="documents-table">
        <thead>
          <tr>
            <th style={{ width: '42%', textAlign: 'left' }}>Document Name</th>
            <th style={{ width: '16%', textAlign: 'left' }}>File Size</th>
            <th style={{ width: '20%', textAlign: 'left' }}>Date Added</th>
            <th style={{ width: '22%', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => {
            const fileUrl = getAbsoluteFileUrl(doc.cloudUrl);
            return (
              <tr 
                key={doc.id} 
                className="document-row"
                onClick={() => onDocumentClick(doc)}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'var(--primary-light)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getFileIcon(doc)}
                    </span>
                    <span className="doc-name-cell" title={doc.filename}>
                      {doc.filename}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="doc-size-cell" style={{ fontWeight: 500 }}>{formatBytes(doc.size)}</span>
                </td>
                <td>
                  <span className="doc-date-cell">{formatDate(doc.uploadedAt)}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div 
                    className="doc-actions-inline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onDocumentClick(doc)}
                      className="doc-btn-inline"
                      title="Preview"
                      aria-label="Preview document"
                      data-tooltip="Preview"
                    >
                      <Eye size={15} />
                    </button>
                    <button 
                      onClick={() => handleDownload(doc)}
                      className="doc-btn-inline" 
                      title="Download File"
                      aria-label="Download file"
                      data-tooltip="Download"
                    >
                      <Download size={15} />
                    </button>
                    <button 
                      onClick={() => onShare(doc)} 
                      className="doc-btn-inline" 
                      title="Generate Share Link"
                      aria-label="Share document"
                      data-tooltip="Share"
                    >
                      <Share2 size={15} />
                    </button>
                    <button 
                      onClick={() => onMove(doc)} 
                      className="doc-btn-inline" 
                      title="Move File"
                      aria-label="Move document"
                      data-tooltip="Move"
                    >
                      <Move size={15} />
                    </button>
                    <button 
                      onClick={() => onDelete(doc)} 
                      className="doc-btn-inline doc-btn-danger-inline" 
                      title="Delete File"
                      aria-label="Delete document"
                      data-tooltip="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {documents.length === 0 && !loading && (
        <div style={{ 
          padding: '48px 20px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          fontSize: '14px',
          fontFamily: 'var(--font-sans)'
        }}>
          No documents available in this view
        </div>
      )}
    </div>
  );
};

export default DocumentList;
