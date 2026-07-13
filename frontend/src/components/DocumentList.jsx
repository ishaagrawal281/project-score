"use client";

import React from 'react';
import { FileText, FileImage, File, Share2, Trash2, Download, Move, MoreVertical } from 'lucide-react';
import { formatBytes, getAbsoluteFileUrl } from './DocumentCard';

const DocumentList = ({ documents, onShare, onDelete, onMove, loading, onDocumentClick }) => {
  const getFileIcon = (doc) => {
    const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(doc.fileType.toLowerCase()) || 
                    /\.(jpg|jpeg|png)$/i.test(doc.filename);
    const isPdf = doc.fileType.includes('pdf') || /\.pdf$/i.test(doc.filename);
    const isDocx = doc.fileType.includes('word') || 
                   doc.fileType.includes('officedocument.wordprocessingml') || 
                   /\.docx$/i.test(doc.filename);

    if (isPdf) {
      return <FileText size={18} style={{ color: '#ef4444' }} />;
    }
    if (isImage) {
      return <FileImage size={18} style={{ color: '#22c55e' }} />;
    }
    if (isDocx) {
      return <FileText size={18} style={{ color: '#3b82f6' }} />;
    }
    return <File size={18} style={{ color: '#64748b' }} />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="documents-table-wrapper">
      <table className="documents-table">
        <thead>
          <tr>
            <th style={{ width: '40%', textAlign: 'left' }}>Name</th>
            <th style={{ width: '15%', textAlign: 'left' }}>Size</th>
            <th style={{ width: '20%', textAlign: 'left' }}>Modified</th>
            <th style={{ width: '25%', textAlign: 'right' }}>Actions</th>
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
                style={{ cursor: 'pointer' }}
              >
                <td style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getFileIcon(doc)}
                  </span>
                  <span className="doc-name-cell" title={doc.filename}>
                    {doc.filename}
                  </span>
                </td>
                <td>
                  <span className="doc-size-cell">{formatBytes(doc.size)}</span>
                </td>
                <td>
                  <span className="doc-date-cell">{formatDate(doc.uploadedAt)}</span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div 
                    className="doc-actions-inline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a 
                      href={fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="doc-btn-inline" 
                      title="Download File"
                      download={doc.filename}
                    >
                      <Download size={16} />
                    </a>
                    <button 
                      onClick={() => onShare(doc)} 
                      className="doc-btn-inline" 
                      title="Generate Share Link"
                    >
                      <Share2 size={16} />
                    </button>
                    <button 
                      onClick={() => onMove(doc)} 
                      className="doc-btn-inline" 
                      title="Move File"
                    >
                      <Move size={16} />
                    </button>
                    <button 
                      onClick={() => onDelete(doc)} 
                      className="doc-btn-inline doc-btn-danger-inline" 
                      title="Delete File"
                    >
                      <Trash2 size={16} />
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
          padding: '40px 20px', 
          textAlign: 'center', 
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}>
          No documents to display
        </div>
      )}
    </div>
  );
};

export default DocumentList;
