"use client";

import React, { useState } from 'react';
import { Folder, FileText, Plus, MoreVertical, Edit2, Trash2, Heart } from 'lucide-react';

const Sidebar = ({ folders = [], activeFolderId, onSelectFolder, onNewFolder, onRenameFolder, onDeleteFolder, loading, isFavoritesActive, onSelectFavorites }) => {
  const [openMenuFolderId, setOpenMenuFolderId] = useState(null);
  // Root container is not a navigable sidebar item; documentFolders contains user directories
  const documentFolders = folders.filter((folder) => folder.parentId !== null);

  const handleFolderMenuClick = (e, folderId) => {
    e.stopPropagation();
    setOpenMenuFolderId(openMenuFolderId === folderId ? null : folderId);
  };

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'hidden' }}>
        
        <div>
          <div className="sidebar-section-title">Navigation</div>
          <ul className="sidebar-menu">
            <li>
              <button
                type="button"
                className={`sidebar-item-link sidebar-folder-button ${activeFolderId === null && !isFavoritesActive ? 'active' : ''}`}
                onClick={() => onSelectFolder(null)}
              >
                <FileText size={18} />
                <span>All Documents</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`sidebar-item-link sidebar-folder-button ${isFavoritesActive ? 'active' : ''}`}
                onClick={onSelectFavorites}
              >
                <Heart size={18} />
                <span>Favorite Documents</span>
              </button>
            </li>
          </ul>
        </div>

        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '4px' }}>
            <div className="sidebar-section-title">Folders</div>
            {onNewFolder && (
              <button
                type="button"
                onClick={onNewFolder}
                title="Create New Folder"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                <Plus size={14} /> New
              </button>
            )}
          </div>

          <ul className="sidebar-menu" style={{ overflowY: 'auto' }}>
            {loading ? (
              <li className="sidebar-loading">Loading folders…</li>
            ) : documentFolders.length ? (
              documentFolders.map((folder) => (
                <li key={folder.id} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    className={`sidebar-item-link sidebar-folder-button ${activeFolderId === folder.id ? 'active' : ''}`}
                    onClick={() => onSelectFolder(folder.id)}
                    style={{ paddingRight: '32px' }}
                  >
                    <Folder size={18} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{folder.name}</span>
                  </button>

                  {(onRenameFolder || onDeleteFolder) && (
                    <button
                      type="button"
                      onClick={(e) => handleFolderMenuClick(e, folder.id)}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <MoreVertical size={14} />
                    </button>
                  )}

                  {openMenuFolderId === folder.id && (
                    <div
                      className="dropdown-menu"
                      style={{ right: '8px', top: '38px', minWidth: '130px', zIndex: 120 }}
                      onMouseLeave={() => setOpenMenuFolderId(null)}
                    >
                      {onRenameFolder && (
                        <div
                          className="dropdown-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuFolderId(null);
                            onRenameFolder(folder);
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Rename</span>
                        </div>
                      )}
                      {onDeleteFolder && (
                        <div
                          className="dropdown-item dropdown-item-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuFolderId(null);
                            onDeleteFolder(folder);
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="sidebar-loading">No folders created yet</li>
            )}
          </ul>
        </div>

      </div>


    </aside>
  );
};

export default Sidebar;
