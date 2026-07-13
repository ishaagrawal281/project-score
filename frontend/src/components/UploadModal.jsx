"use client";

import React, { useState, useRef } from 'react';
import { X, UploadCloud, File, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../services/api';
import UploadProgress from './UploadProgress';

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.docx'];
const REJECTED_EXTENSIONS = ['.exe', '.zip', '.apk', '.bat', '.js'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const UploadModal = ({ isOpen, onClose, folders = [], currentFolderId, onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFolderId, setTargetFolderId] = useState(currentFolderId || (folders[0]?.id || ''));
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Sync target folder selection when currentFolderId updates
  React.useEffect(() => {
    if (currentFolderId) {
      setTargetFolderId(currentFolderId);
    } else if (folders.length > 0 && !targetFolderId) {
      setTargetFolderId(folders[0].id);
    }
  }, [currentFolderId, folders]);

  if (!isOpen) return null;

  const validateFile = (file) => {
    if (!file) return false;
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    // Explicit blacklist check
    if (REJECTED_EXTENSIONS.includes(fileExt)) {
      setErrorMsg(`Security block: Files with extension "${fileExt}" are strictly prohibited.`);
      setSelectedFile(null);
      return false;
    }

    // Whitelist check
    if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
      setErrorMsg(`Unsupported format. Only PDF, JPG, JPEG, PNG, and DOCX files are allowed.`);
      setSelectedFile(null);
      return false;
    }

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      setErrorMsg('File too large. Maximum allowable size is 10 MB.');
      setSelectedFile(null);
      return false;
    }

    setErrorMsg('');
    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (!selectedFile || !targetFolderId) {
      setErrorMsg('Please select a file and a destination directory.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMsg('');
    setSuccessMsg('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('folderId', targetFolderId);

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setSuccessMsg(res.data.message || 'File uploaded successfully.');
      setSelectedFile(null);
      
      // Delay closing to let the user see the success message
      setTimeout(() => {
        onUploadSuccess();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.error || 'Failed to upload document. Please try again.');
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return; // Prevent closing while uploading
    setSelectedFile(null);
    setErrorMsg('');
    setSuccessMsg('');
    setUploadProgress(0);
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Upload Document</h3>
          <button className="modal-close" onClick={handleClose} disabled={isUploading}>
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="alert alert-danger">
            <AlertTriangle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Destination Folder</label>
          <select 
            className="form-input" 
            value={targetFolderId} 
            onChange={(e) => setTargetFolderId(e.target.value)}
            disabled={isUploading}
            style={{ appearance: 'none', background: 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2364748b\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'><polyline points=\'6 9 12 15 18 9\'></polyline></svg>") no-repeat right 16px center/16px', backgroundColor: '#fafbfc' }}
          >
            {folders.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {!selectedFile && !isUploading && (
          <div 
            className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleFileSelect} 
            />
            <UploadCloud size={40} className="upload-zone-icon" />
            <p className="upload-zone-text">Drag & drop your file here, or <span style={{ color: 'var(--primary)', fontWeight: 600 }}>browse</span></p>
            <p className="upload-zone-subtext">Supported: PDF, JPG, PNG, DOCX (Max 10MB)</p>
          </div>
        )}

        {selectedFile && !isUploading && (
          <div className="selected-file-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <File size={20} className="folder-icon" style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <span style={{ fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedFile.name}
              </span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {isUploading && (
          <UploadProgress progress={uploadProgress} fileName={selectedFile?.name || 'File'} />
        )}

        <div className="modal-footer">
          <button 
            className="btn btn-secondary" 
            onClick={handleClose} 
            disabled={isUploading}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            Start Upload
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
