"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import '../styles/InputModal.css';

const InputModal = ({ isOpen, title, label, placeholder, defaultValue = '', onConfirm, onCancel }) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    onConfirm(value.trim());
    setValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="input-modal-overlay" onClick={onCancel}>
      <div className="input-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="input-modal-header">
          <h3 className="input-modal-title">{title}</h3>
          <button className="input-modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="input-modal-body">
          <label className="input-modal-label">{label}</label>
          <input
            ref={inputRef}
            type="text"
            className="input-modal-input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="input-modal-footer">
          <button 
            className="input-modal-btn input-modal-btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="input-modal-btn input-modal-btn-primary"
            onClick={handleConfirm}
            disabled={!value.trim()}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
