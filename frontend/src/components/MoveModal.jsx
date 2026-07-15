"use client";

import React, { useState, useEffect } from 'react';
import { X, Folder, AlertTriangle } from 'lucide-react';

const MoveModal = ({ isOpen, onClose, doc, folders = [], onMoveSuccess }) => {
  const [targetFolderId, setTargetFolderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (doc && folders.length > 0) {
      // Find the first folder that is not the document's current folder as a default select option
      const alternativeFolder = folders.find(f => f.id !== doc.folderId);
      setTargetFolderId(alternativeFolder ? alternativeFolder.id : folders[0].id);
    }
  }, [doc, folders]);

  if (!isOpen || !doc) return null;

  const handleMove = async () => {
    if (!targetFolderId) {
      setErrorMsg('Please select a destination folder.');
      return;
    }

    if (parseInt(targetFolderId, 10) === doc.folderId) {
      setErrorMsg('The document is already located in the selected folder.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${BACKEND}/api/documents/${doc.id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId: parseInt(targetFolderId, 10) })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to move document');
      }
      onMoveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to move document to the target folder.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Move Document</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-medium)', marginBottom: '8px' }}>
            Relocating: <strong style={{ color: 'var(--text-main)' }}>{doc.filename}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label font-sans">Choose Destination Folder</label>
          <select 
            className="form-input" 
            value={targetFolderId} 
            onChange={(e) => setTargetFolderId(e.target.value)}
            disabled={loading}
            style={{ appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center/16px', backgroundColor: '#fafbfc' }}
          >
            {folders.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} {f.id === doc.folderId ? '(Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleMove}
            disabled={loading || !targetFolderId}
          >
            {loading ? 'Moving...' : 'Move File'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;
