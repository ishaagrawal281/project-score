import { useState, useCallback } from 'react';

/**
 * Hook to manage input modal state and provide a prompt-like function
 * Usage:
 *   const { isOpen, title, label, placeholder, defaultValue, openModal, closeModal, handleConfirm } = useInputModal();
 *   
 *   // To show the modal:
 *   await openModal({ title: 'New Folder', label: 'Folder name:', placeholder: 'Enter name...' });
 */
export const useInputModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    label: '',
    placeholder: '',
    defaultValue: ''
  });
  const [resolvePromise, setResolvePromise] = useState(null);

  const openModal = useCallback((modalConfig) => {
    return new Promise((resolve) => {
      setConfig({
        title: modalConfig.title || '',
        label: modalConfig.label || '',
        placeholder: modalConfig.placeholder || '',
        defaultValue: modalConfig.defaultValue || ''
      });
      setResolvePromise(() => resolve);
      setIsOpen(true);
    });
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(null);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleConfirm = useCallback((value) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(value);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  return {
    isOpen,
    title: config.title,
    label: config.label,
    placeholder: config.placeholder,
    defaultValue: config.defaultValue,
    openModal,
    closeModal,
    handleConfirm
  };
};

export default useInputModal;
