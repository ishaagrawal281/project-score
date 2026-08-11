"use client";

import React, { useState, useEffect } from 'react';
import { X, Download, Share2, Move, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { getAbsoluteFileUrl, formatBytes } from './DocumentCard';
import { forceDownload } from '../utils/downloadHelper';

const DocumentViewer = ({ doc, onClose, onShare, onMove, onDelete, allDocuments = [] }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Find current document index in all documents
  useEffect(() => {
    if (allDocuments.length > 0 && doc) {
      const index = allDocuments.findIndex(d => d.id === doc.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [doc, allDocuments]);

  const currentDoc = allDocuments[currentIndex] || doc;
  const currentFileUrl = getAbsoluteFileUrl(currentDoc?.cloudUrl);

  const fileTypeStr = (currentDoc?.fileType || '').toLowerCase();
  const filenameStr = (currentDoc?.filename || '').toLowerCase();

  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(fileTypeStr) || 
                  /\.(jpg|jpeg|png)$/i.test(filenameStr);
  const isPdf = fileTypeStr.includes('pdf') || /\.pdf$/i.test(filenameStr);
  const isDocx = fileTypeStr.includes('word') || 
                 fileTypeStr.includes('officedocument.wordprocessingml') || 
                 /\.docx$/i.test(filenameStr);

  const uploadDate = currentDoc?.uploadedAt ? new Date(currentDoc.uploadedAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < allDocuments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="viewer-image-container">
          <img 
            src={currentFileUrl} 
            alt={currentDoc.filename}
            className="viewer-image"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%23999"%3EImage not found%3C/text%3E%3C/svg%3E';
            }}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="viewer-embed-container">
          <iframe
            src={`${currentFileUrl}#toolbar=0`}
            type="application/pdf"
            className="viewer-embed"
            title={currentDoc.filename}
          />
        </div>
      );
    }

    if (isDocx) {
      return (
        <div className="viewer-placeholder">
          <div className="viewer-placeholder-icon" style={{ color: '#3b82f6' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          </div>
          <h4 className="viewer-placeholder-title">Word Document</h4>
          <p className="viewer-placeholder-text">{currentDoc.filename}</p>
          <p className="viewer-placeholder-hint">Click download to view or edit this document</p>
        </div>
      );
    }

    return (
      <div className="viewer-placeholder">
        <div className="viewer-placeholder-icon" style={{ color: '#64748b' }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
            <polyline points="13 2 13 9 20 9" />
          </svg>
        </div>
        <h4 className="viewer-placeholder-title">File Preview</h4>
        <p className="viewer-placeholder-text">{currentDoc.filename}</p>
        <p className="viewer-placeholder-hint">Download to view this file</p>
      </div>
    );
  };

  return (
    <div className="document-viewer-overlay" onClick={onClose}>
      <div className="document-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="viewer-header">
          <div className="viewer-title-section">
            <h2 className="viewer-title">{currentDoc.filename}</h2>
            <span className="viewer-meta">{formatBytes(currentDoc.size)}</span>
          </div>
          <button 
            className="viewer-close-btn" 
            onClick={onClose}
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="viewer-preview">
          {renderPreview()}
        </div>

        {/* Navigation for multiple documents */}
        {allDocuments.length > 1 && (
          <div className="viewer-navigation">
            <button 
              className="viewer-nav-btn"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              title="Previous document"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="viewer-nav-counter">
              {currentIndex + 1} of {allDocuments.length}
            </span>
            <button 
              className="viewer-nav-btn"
              onClick={handleNext}
              disabled={currentIndex === allDocuments.length - 1}
              title="Next document"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Footer with Actions */}
        <div className="viewer-footer">
          <div className="viewer-info">
            <span className="viewer-date">Uploaded on {uploadDate}</span>
          </div>
          <div className="viewer-actions">
            <button 
              className="viewer-action-btn"
              onClick={() => forceDownload(currentFileUrl, currentDoc.filename)}
              title="Download"
            >
              <Download size={18} />
              <span>Download</span>
            </button>
            <button className="viewer-action-btn" onClick={onClose} title="Close preview">
              <X size={18} />
              <span>Close</span>
            </button>
            <button 
              className="viewer-action-btn"
              onClick={() => {
                onShare(currentDoc);
                onClose();
              }}
              title="Share"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
            <button 
              className="viewer-action-btn"
              onClick={() => {
                onMove(currentDoc);
                onClose();
              }}
              title="Move"
            >
              <Move size={18} />
              <span>Move</span>
            </button>
            <button 
              className="viewer-action-btn viewer-action-danger"
              onClick={() => {
                onDelete(currentDoc);
                onClose();
              }}
              title="Delete"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
