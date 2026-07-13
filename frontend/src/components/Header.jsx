"use client";

import React from 'react';
import { UploadCloud, FolderPlus, ChevronRight } from 'lucide-react';

/**
 * Renders Breadcrumbs navigation paths and action triggers for folder/file additions.
 */
const Header = ({ breadcrumbs = [], onNavigate, onUpload, onNewFolder }) => {
  return (
    <header className="main-header">
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id || `crumb-${idx}`}>
              {idx > 0 && <ChevronRight size={18} className="breadcrumbs-separator" />}
              {isLast ? (
                <span className="breadcrumbs-active" style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                  {crumb.name}
                </span>
              ) : (
                <span 
                  className="breadcrumbs-link" 
                  onClick={() => onNavigate(crumb.id)}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {crumb.name}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="header-actions">
        {onNewFolder && (
          <button className="btn btn-secondary" onClick={onNewFolder}>
            <FolderPlus size={16} />
            <span>New Folder</span>
          </button>
        )}
        {onUpload && (
          <button className="btn btn-primary" onClick={onUpload}>
            <UploadCloud size={16} />
            <span>Upload File</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
