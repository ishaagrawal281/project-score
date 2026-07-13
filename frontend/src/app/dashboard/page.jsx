"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import FolderCard from '../../components/FolderCard';
import DocumentList from '../../components/DocumentList';
import DocumentViewer from '../../components/DocumentViewer';
import SkeletonLoader from '../../components/SkeletonLoader';
import UploadModal from '../../components/UploadModal';
import ShareModal from '../../components/ShareModal';
import MoveModal from '../../components/MoveModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AlertCircle, FileQuestion, FolderOpen, ArrowUpRight, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const DashboardContent = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';

  // Core state
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  
  // Pagination & Loading state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [foldersLoading, setFoldersLoading] = useState(true);
  const [docsLoading, setDocsLoading] = useState(false);
  
  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedShareDoc, setSelectedShareDoc] = useState(null);
  const [selectedMoveDoc, setSelectedMoveDoc] = useState(null);
  const [selectedViewerDoc, setSelectedViewerDoc] = useState(null);
  
  // Layout toggles
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const observerTargetRef = useRef(null);

  // 1. Load all folders
  const fetchFolders = async () => {
    setFoldersLoading(true);
    setActionError('');
    try {
      const res = await api.get('/folders');
      setFolders(res.data.folders);
      
      // If we don't have a currentFolderId, find the root folder "My Documents" (parentId === null)
      if (currentFolderId === null && res.data.folders.length > 0) {
        const root = res.data.folders.find(f => f.parentId === null);
        if (root) {
          setCurrentFolderId(root.id);
        }
      }
    } catch (err) {
      console.error(err);
      setActionError('Failed to load folders directories.');
    } finally {
      setFoldersLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  // 2. Fetch documents (triggered on folder change, page change, search query change)
  const fetchDocuments = async (pageNum, append = false) => {
    if (docsLoading) return;
    setDocsLoading(true);
    setActionError('');

    try {
      let url = `/documents?page=${pageNum}&limit=20`;
      
      if (searchQuery) {
        // Global search overrides active folder ID
        url += `&search=${encodeURIComponent(searchQuery)}`;
      } else if (currentFolderId) {
        url += `&folderId=${currentFolderId}`;
      } else {
        // If neither, wait until folder hierarchy is resolved
        setDocsLoading(false);
        return;
      }

      const res = await api.get(url);
      const newDocs = res.data.documents;

      if (append) {
        setDocuments(prev => [...prev, ...newDocs]);
      } else {
        setDocuments(newDocs);
      }

      setHasMore(res.data.pagination.hasMore);
    } catch (err) {
      console.error(err);
      setActionError('Failed to fetch documents list.');
    } finally {
      setDocsLoading(false);
    }
  };

  // Reset page and documents list whenever folder or search query changes
  useEffect(() => {
    setPage(1);
    fetchDocuments(1, false);
  }, [currentFolderId, searchQuery]);

  // Load next page when pagination page index increments
  useEffect(() => {
    if (page > 1) {
      fetchDocuments(page, true);
    }
  }, [page]);

  // 3. Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !docsLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5, rootMargin: '100px' }
    );

    const target = observerTargetRef.current;
    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, docsLoading]);

  // 4. Breadcrumbs trace
  const getBreadcrumbs = () => {
    if (searchQuery) {
      return [{ id: 'search', name: `Search Results for "${searchQuery}"` }];
    }

    if (!currentFolderId || folders.length === 0) {
      return [{ id: 'root', name: 'My Documents' }];
    }

    const path = [];
    let current = folders.find(f => f.id === currentFolderId);
    while (current) {
      path.unshift(current);
      if (current.parentId === null) break;
      current = folders.find(f => f.id === current.parentId);
    }
    return path;
  };

  // Filter child folders for current view
  const getChildFolders = () => {
    if (searchQuery) return []; // Hide subfolders on search view
    if (!currentFolderId) return [];
    return folders.filter(f => f.parentId === currentFolderId);
  };

  // 5. Folder CRUD & Document Actions
  const handleNewFolder = async () => {
    const name = window.prompt('Enter folder name:');
    if (!name || name.trim() === '') return;

    try {
      await api.post('/folders', {
        name: name.trim(),
        parentId: currentFolderId
      });
      showSuccess('Folder created successfully.');
      fetchFolders();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to create folder.');
    }
  };

  const handleRenameFolder = async (folder) => {
    const newName = window.prompt('Enter new name for folder:', folder.name);
    if (!newName || newName.trim() === '' || newName.trim() === folder.name) return;

    try {
      await api.put(`/folders/${folder.id}`, { name: newName.trim() });
      showSuccess('Folder renamed successfully.');
      fetchFolders();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to rename folder.');
    }
  };

  const handleDeleteFolder = async (folder) => {
    if (!window.confirm(`Are you sure you want to delete folder "${folder.name}"?`)) return;

    try {
      await api.delete(`/folders/${folder.id}`);
      showSuccess('Folder deleted successfully.');
      fetchFolders();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to delete folder.');
    }
  };

  const handleDeleteDocument = async (doc) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.filename}"? This action is permanent.`)) return;

    try {
      await api.delete(`/documents/${doc.id}`);
      showSuccess('Document deleted successfully.');
      // Refresh current document list
      fetchDocuments(1, false);
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to delete document.');
    }
  };

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="dashboard-main">
        {actionError && (
          <div className="alert alert-danger" style={{ marginBottom: '20px' }}>
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '20px' }}>
            <CheckCircle size={16} style={{ color: 'var(--success)' }} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Directory Controls and Breadcrumbs */}
        <Header 
          breadcrumbs={getBreadcrumbs()} 
          onNavigate={(id) => setCurrentFolderId(id)}
          onUpload={searchQuery ? null : () => setIsUploadOpen(true)}
          onNewFolder={searchQuery ? null : handleNewFolder}
        />

        {/* Folders List (Hidden during search queries) */}
        {!searchQuery && (
          <section style={{ marginBottom: '24px' }}>
            {getChildFolders().length > 0 && <h3 className="section-title">Folders</h3>}
            {foldersLoading ? (
              <SkeletonLoader type="folder" count={3} />
            ) : (
              <div className="folders-grid">
                {getChildFolders().map(folder => (
                  <FolderCard
                    key={folder.id}
                    folder={folder}
                    onOpen={(f) => setCurrentFolderId(f.id)}
                    onRename={handleRenameFolder}
                    onDelete={handleDeleteFolder}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Documents list */}
        <section className="documents-section">
          {documents.length > 0 && <h3 className="section-title">Documents</h3>}
          
          {docsLoading && page === 1 ? (
            <div style={{ marginTop: '20px' }}>
              <SkeletonLoader type="card" count={4} />
            </div>
          ) : documents.length > 0 ? (
            <>
              <DocumentList
                documents={documents}
                onShare={(d) => setSelectedShareDoc(d)}
                onMove={(d) => setSelectedMoveDoc(d)}
                onDelete={handleDeleteDocument}
                loading={docsLoading}
                onDocumentClick={(d) => setSelectedViewerDoc(d)}
              />
              
              {/* Observer Anchor */}
              {hasMore && (
                <div ref={observerTargetRef} className="load-more-anchor">
                  <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                </div>
              )}
            </>
          ) : getChildFolders().length === 0 ? (
            <div className="empty-state">
              <FolderOpen size={48} className="empty-state-icon" />
              <h4 className="empty-state-title">This folder is empty</h4>
              <p className="empty-state-text">Upload documents or create subfolders to start organizing.</p>
              <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
                Upload File
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <FileQuestion size={48} className="empty-state-icon" />
              <h4 className="empty-state-title">No search results found</h4>
              <p className="empty-state-text">We couldn't find any documents matching "{searchQuery}".</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {selectedViewerDoc && (
        <DocumentViewer 
          doc={selectedViewerDoc}
          onClose={() => setSelectedViewerDoc(null)}
          onShare={(d) => setSelectedShareDoc(d)}
          onMove={(d) => setSelectedMoveDoc(d)}
          onDelete={handleDeleteDocument}
          allDocuments={documents}
        />
      )}

      <UploadModal 
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        folders={folders}
        currentFolderId={currentFolderId}
        onUploadSuccess={() => {
          showSuccess('Upload successful.');
          fetchDocuments(1, false);
        }}
      />

      <ShareModal 
        isOpen={!!selectedShareDoc}
        onClose={() => setSelectedShareDoc(null)}
        doc={selectedShareDoc}
      />

      <MoveModal
        isOpen={!!selectedMoveDoc}
        onClose={() => setSelectedMoveDoc(null)}
        doc={selectedMoveDoc}
        folders={folders}
        onMoveSuccess={() => {
          showSuccess('Document relocated successfully.');
          fetchDocuments(1, false);
        }}
      />
    </div>
  );
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="dashboard-layout"><main className="dashboard-main">Loading Dashboard...</main></div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
