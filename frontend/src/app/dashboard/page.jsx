"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import DocumentCard, { formatBytes } from '../../components/DocumentCard';
import DocumentList from '../../components/DocumentList';
import DocumentViewer from '../../components/DocumentViewer';
import SkeletonLoader from '../../components/SkeletonLoader';
import UploadModal from '../../components/UploadModal';
import ShareModal from '../../components/ShareModal';
import MoveModal from '../../components/MoveModal';
import ConfirmModal from '../../components/ConfirmModal';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  AlertCircle, 
  FileQuestion, 
  FolderOpen, 
  FolderPlus, 
  UploadCloud, 
  CheckCircle, 
  HardDrive, 
  LayoutGrid, 
  List,
  Clock
} from 'lucide-react';

const DashboardContent = () => {
  const { token } = useAuth();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';

  // Core state
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  
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
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = useState(null);
  
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const observerTargetRef = useRef(null);

  // 1. Load all folders
  const fetchFolders = async () => {
    setFoldersLoading(true);
    setActionError('');
    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/folders`, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (res.status === 401) {
        window.location.href = '/login?expired=true';
        return;
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch folders');
      }
      const data = await res.json();
      setFolders(data.folders || []);
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Failed to load folders directories.');
    } finally {
      setFoldersLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [token]);

  // 2. Fetch documents
  const fetchDocuments = async (pageNum, append = false) => {
    if (docsLoading) return;
    setDocsLoading(true);
    setActionError('');

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      let url = `${BACKEND}/api/documents?page=${pageNum}&limit=20`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      } else if (currentFolderId) {
        url += `&folderId=${currentFolderId}`;
      }

      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(url, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });

      if (res.status === 401) {
        window.location.href = '/login?expired=true';
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch documents');
      }

      const data = await res.json();
      const newDocs = data.documents || [];

      if (append) {
        setDocuments(prev => [...prev, ...newDocs]);
      } else {
        setDocuments(newDocs);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (err) {
      console.error(err);
      setActionError(err.message || 'Failed to fetch documents list.');
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchDocuments(1, false);
  }, [currentFolderId, searchQuery]);

  useEffect(() => {
    if (page > 1) {
      fetchDocuments(page, true);
    }
  }, [page]);

  // Infinite scroll
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

  // Breadcrumbs trace
  const getBreadcrumbs = () => {
    if (searchQuery) {
      return [{ id: 'search', name: `Search Results for "${searchQuery}"` }];
    }

    const selectedFolder = folders.find((folder) => folder.id === currentFolderId);
    if (!selectedFolder) {
      return [{ id: null, name: 'Recently Viewed Documents' }];
    }

    return [
      { id: null, name: 'All Documents' },
      selectedFolder
    ];
  };

  const rootFolderId = folders.find((folder) => folder.parentId === null)?.id || null;
  const activeFolder = folders.find((folder) => folder.id === currentFolderId);
  const uploadFolderId = currentFolderId || rootFolderId;

  // Calculate Metrics - Total Storage ONLY
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);

  // Folder CRUD & Document Actions
  const handleNewFolder = async () => {
    const name = await window.prompt('Enter folder name:');
    if (!name || name.trim() === '') return;

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/folders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          name: name.trim(),
          parentId: currentFolderId || rootFolderId
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create folder');
      }
      showSuccess('Folder created successfully.');
      fetchFolders();
    } catch (err) {
      setActionError(err.message || 'Failed to create folder.');
    }
  };

  const handleRenameFolder = async (folder) => {
    const newName = await window.prompt('Enter new name for folder:', folder.name);
    if (!newName || newName.trim() === '' || newName.trim() === folder.name) return;

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/folders/${folder.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ name: newName.trim() })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to rename folder');
      }
      showSuccess('Folder renamed successfully.');
      fetchFolders();
    } catch (err) {
      setActionError(err.message || 'Failed to rename folder.');
    }
  };

  const handleDeleteFolder = (folder) => {
    setDeleteFolderTarget(folder);
  };

  const executeDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    const folder = deleteFolderTarget;
    setDeleteFolderTarget(null);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/folders/${folder.id}`, {
        method: 'DELETE',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete folder');
      }
      showSuccess('Folder deleted successfully.');
      fetchFolders();
      if (currentFolderId === folder.id) {
        setCurrentFolderId(null);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to delete folder.');
    }
  };

  const handleDeleteDocument = (doc) => {
    setDeleteDocTarget(doc);
  };

  const executeDeleteDocument = async () => {
    if (!deleteDocTarget) return;
    const doc = deleteDocTarget;
    setDeleteDocTarget(null);

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
      const res = await fetch(`${BACKEND}/api/documents/${doc.id}`, {
        method: 'DELETE',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete document');
      }
      showSuccess('Document deleted successfully.');
      fetchDocuments(1, false);
    } catch (err) {
      setActionError(err.message || 'Failed to delete document.');
    }
  };

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 3000);
  };

  return (
    <div className="dashboard-layout">
      <Navbar />
      
      <Sidebar
        folders={folders}
        activeFolderId={currentFolderId}
        onSelectFolder={setCurrentFolderId}
        onNewFolder={handleNewFolder}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
        loading={foldersLoading}
      />
      
      <main className="dashboard-main">
        {actionError && (
          <div className="alert alert-danger">
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {actionSuccess && (
          <div className="alert alert-success">
            <CheckCircle size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}


        {/* Directory Controls and Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <Header 
            breadcrumbs={getBreadcrumbs()} 
            onNavigate={(id) => setCurrentFolderId(id)}
          />
        </div>

        {/* Main Content Area: Recently Viewed Documents / Folder Documents */}
        <section className="documents-section">
          <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {currentFolderId === null ? (
              <>
                <Clock size={15} style={{ color: 'var(--primary)' }} />
                <span>Recently Viewed Documents ({documents.length})</span>
              </>
            ) : (
              <span>Folder Documents ({documents.length})</span>
            )}
          </div>

          {docsLoading && page === 1 ? (
            <div style={{ marginTop: '20px' }}>
              <SkeletonLoader type="card" count={4} />
            </div>
          ) : documents.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <DocumentList
                  documents={documents}
                  onShare={(d) => setSelectedShareDoc(d)}
                  onMove={(d) => setSelectedMoveDoc(d)}
                  onDelete={handleDeleteDocument}
                  loading={docsLoading}
                  onDocumentClick={(d) => setSelectedViewerDoc(d)}
                />
              ) : (
                <div className="documents-grid">
                  {documents.map((doc) => (
                    <DocumentCard 
                      key={doc.id}
                      doc={doc}
                      onShare={(d) => setSelectedShareDoc(d)}
                      onMove={(d) => setSelectedMoveDoc(d)}
                      onDelete={handleDeleteDocument}
                    />
                  ))}
                </div>
              )}
              
              {/* Observer Anchor */}
              {hasMore && (
                <div ref={observerTargetRef} className="load-more-anchor">
                  <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                </div>
              )}
            </>
          ) : searchQuery ? (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <FileQuestion size={36} />
              </div>
              <h4 className="empty-state-title">No matching records found</h4>
              <p className="empty-state-text">We couldn't find any documents matching "{searchQuery}".</p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <FolderOpen size={36} />
              </div>
              <h4 className="empty-state-title">{activeFolder ? `Folder "${activeFolder.name}" is empty` : 'No recently viewed documents'}</h4>
              <p className="empty-state-text">{activeFolder ? 'Upload documents to start populating this folder.' : 'Upload your documents to see them listed here.'}</p>
              <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)}>
                <UploadCloud size={16} />
                <span>Upload Document</span>
              </button>
            </div>
          )}
        </section>
      </main>

      <div className="dashboard-fixed-actions">
        <button className="btn btn-secondary" onClick={handleNewFolder}>
          <FolderPlus size={16} />
          <span>New Folder</span>
        </button>
        <button className="btn btn-primary" onClick={() => setIsUploadOpen(true)} disabled={!uploadFolderId}>
          <UploadCloud size={16} />
          <span>Upload File</span>
        </button>
      </div>

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
        currentFolderId={uploadFolderId}
        token={token}
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

      <ConfirmModal
        isOpen={!!deleteDocTarget}
        onClose={() => setDeleteDocTarget(null)}
        onConfirm={executeDeleteDocument}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteDocTarget?.filename}"? This action is permanent and cannot be undone.`}
        confirmText="Delete File"
        danger={true}
      />

      <ConfirmModal
        isOpen={!!deleteFolderTarget}
        onClose={() => setDeleteFolderTarget(null)}
        onConfirm={executeDeleteFolder}
        title="Delete Folder"
        message={`Are you sure you want to delete folder "${deleteFolderTarget?.name}"? All files inside will be permanently removed.`}
        confirmText="Delete Folder"
        danger={true}
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
