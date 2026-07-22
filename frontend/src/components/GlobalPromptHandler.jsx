"use client";

import React, { useState, useEffect, useRef } from 'react';
import InputModal from './InputModal';

const GlobalPromptHandler = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    label: '',
    placeholder: '',
    defaultValue: ''
  });
  const resolveRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    const originalPrompt = window.prompt;

    window.prompt = (message, defaultValue = '') => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        
        const cleanMsg = message ? message.replace(/:$/, '').trim() : 'Enter value';
        
        setConfig({
          title: cleanMsg,
          label: '',
          placeholder: 'e.g. Work Documents',
          defaultValue: defaultValue || ''
        });
        setIsOpen(true);
      });
    };

    return () => {
      window.prompt = originalPrompt;
    };
  }, []);

  const handleConfirm = (value) => {
    resultRef.current = value;
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(value);
      resolveRef.current = null;
    }
  };

  const handleCancel = () => {
    resultRef.current = null;
    setIsOpen(false);
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
  };

  return (
    <>
      {children}
      <InputModal
        isOpen={isOpen}
        title={config.title}
        label={config.label}
        placeholder={config.placeholder}
        defaultValue={config.defaultValue}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
};

export default GlobalPromptHandler;
