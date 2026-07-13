"use client";

import React from 'react';

/**
 * Progress bar indicator for ongoing files transfer.
 */
const UploadProgress = ({ progress, fileName }) => {
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span 
          style={{ 
            fontWeight: 500, 
            fontSize: '13px', 
            overflow: 'hidden', 
            textOverflow: 'ellipsis', 
            whiteSpace: 'nowrap', 
            maxWidth: '75%' 
          }}
          title={fileName}
        >
          Uploading: {fileName}
        </span>
        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--primary)' }}>
          {progress}%
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default UploadProgress;
