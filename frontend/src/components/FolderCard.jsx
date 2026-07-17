"use client";

import React, { useState } from 'react';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';

/**
 * Folder card component. Double-click or single-click details to enter directories.
 */
const FolderCard = ({ folder, onOpen, onRename, onDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const executeAction = (e, callback) => {
    e.stopPropagation();
    setShowDropdown(false);
    callback(folder);
  };

  return (
    <div 
      className={`folder-card${showDropdown ? ' folder-card-menu-open' : ''}`}
      onDoubleClick={() => onOpen(folder)}
      style={{ position: 'relative' }}
    >
      <div 
        className="folder-info" 
        onClick={() => onOpen(folder)}
        style={{ flexGrow: 1, minWidth: 0 }}
      >
        <Folder className="folder-icon" size={22} style={{ fill: '#fcd34d' }} />
        <span className="folder-name" title={folder.name}>
          {folder.name}
        </span>
      </div>

      <button 
        className="folder-menu-trigger" 
        onClick={toggleDropdown}
        style={{ flexShrink: 0 }}
      >
        <MoreVertical size={16} />
      </button>

      {showDropdown && (
        <div 
          className="dropdown-menu" 
          style={{ right: '8px', top: '44px', minWidth: '130px' }}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <div 
            className="dropdown-item" 
            onClick={(e) => executeAction(e, onRename)}
          >
            <Edit2 size={14} />
            <span>Rename</span>
          </div>
          <div 
            className="dropdown-item dropdown-item-danger" 
            onClick={(e) => executeAction(e, onDelete)}
          >
            <Trash2 size={14} />
            <span>Delete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderCard;
