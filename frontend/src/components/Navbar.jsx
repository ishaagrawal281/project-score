"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, X, SlidersHorizontal, LogOut, HardDrive, ShieldCheck } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const FILTER_KEYS = ['scope', 'folder', 'dateFrom', 'dateTo', 'type', 'size', 'favorites', 'sort'];

const Navbar = ({ folders = [] }) => {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterPanelRef = useRef(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState({});

  const searchVal = searchParams?.get('search') || '';
  const activeFilters = Object.fromEntries(FILTER_KEYS.map((key) => [key, searchParams?.get(key) || '']));
  const activeFilterEntries = FILTER_KEYS.filter((key) => activeFilters[key] && activeFilters[key] !== 'all');

  useEffect(() => {
    if (!showFilters) return undefined;
    const closeOnOutsideClick = (event) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) setShowFilters(false);
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [showFilters]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') params.delete(key);
      else params.set(key, value);
    });
    const query = params.toString();
    router.replace(query ? `?${query}` : '/dashboard');
  };

  const handleSearchChange = (event) => updateParams({ search: event.target.value });
  const handleOpenFilters = () => {
    setDraftFilters(activeFilters);
    setShowFilters((open) => !open);
  };
  const applyFilters = () => {
    updateParams(draftFilters);
    setShowFilters(false);
  };
  const resetFilters = () => {
    const reset = Object.fromEntries(FILTER_KEYS.map((key) => [key, '']));
    setDraftFilters(reset);
    updateParams(reset);
    setShowFilters(false);
  };
  const removeFilter = (key) => updateParams({ [key]: '' });

  const chipLabels = {
    scope: { filename: 'File name' },
    type: { pdf: 'PDF (.pdf)', docx: 'Word (.docx)', jpg: 'Image (.jpg)', jpeg: 'Image (.jpeg)', png: 'Image (.png)' },
    size: { under1: 'Under 1 MB', oneToTen: '1 MB – 10 MB', tenToHundred: '10 MB – 100 MB', hundredToOneGb: '100 MB – 1 GB', oneToThreeGb: '1 GB – 3 GB' },
    favorites: { true: 'Favorites' },
    sort: { newest: 'Newest first', oldest: 'Oldest first', az: 'A–Z', za: 'Z–A', largest: 'Largest first', smallest: 'Smallest first' }
  };
  const getChipLabel = (key) => {
    if (key === 'folder') return folders.find((folder) => String(folder.id) === activeFilters.folder)?.name || 'Folder';
    if (key === 'dateFrom') return `From ${activeFilters.dateFrom}`;
    if (key === 'dateTo') return `To ${activeFilters.dateTo}`;
    return chipLabels[key]?.[activeFilters[key]] || activeFilters[key];
  };
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
        <div className="nav-brand-icon-wrap"><HardDrive size={22} /></div>
        <span>DocVault</span>
      </div>

      <div className="search-container" ref={filterPanelRef}>
        <div className="search-controls">
          <div className="search-bar-wrapper">
            <Search size={18} className="search-icon-left" />
            <input type="search" className="search-input" placeholder="Search documents by file name..." value={searchVal} onChange={handleSearchChange} aria-label="Search documents by file name" />
            {searchVal && <button className="search-clear-button" onClick={() => updateParams({ search: '' })} aria-label="Clear search"><X size={15} /></button>}
          </div>
          <button className={`filters-button${activeFilterEntries.length ? ' filters-button-active' : ''}`} onClick={handleOpenFilters} aria-expanded={showFilters}>
            <SlidersHorizontal size={16} />
            <span>Filters</span>
          </button>
        </div>

        {activeFilterEntries.length > 0 && (
          <div className="active-filter-chips">
            {activeFilterEntries.map((key) => (
              <button key={key} className="filter-chip" onClick={() => removeFilter(key)}>
                <span>{getChipLabel(key)}</span><X size={12} />
              </button>
            ))}
            {activeFilterEntries.length > 1 && <button className="clear-all-filters" onClick={resetFilters}>Clear All</button>}
          </div>
        )}

        {showFilters && (
          <div className="filters-popover" role="dialog" aria-label="Document filters">
            <div className="filter-group">
              <span className="filter-group-title">Search Scope</span>
              <div className="filter-radio-list">
                {[['all', 'Global Search'], ['filename', 'File Name']].map(([value, label]) => (
                  <label key={value} className="filter-choice"><input type="radio" name="scope" checked={(draftFilters.scope || 'all') === value} onChange={() => setDraftFilters({ ...draftFilters, scope: value })} />{label}</label>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <span className="filter-group-title">Filters</span>
              <div className="filter-select-grid">
                <label>Folder<select value={draftFilters.folder || ''} onChange={(e) => setDraftFilters({ ...draftFilters, folder: e.target.value })}><option value="">All Folders</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label>
                <label>From<input type="date" value={draftFilters.dateFrom || ''} onChange={(e) => setDraftFilters({ ...draftFilters, dateFrom: e.target.value })} /></label>
                <label>To<input type="date" value={draftFilters.dateTo || ''} onChange={(e) => setDraftFilters({ ...draftFilters, dateTo: e.target.value })} /></label>
                <label>File Type<select value={draftFilters.type || ''} onChange={(e) => setDraftFilters({ ...draftFilters, type: e.target.value })}><option value="">All Types</option><option value="pdf">PDF (.pdf)</option><option value="docx">Word Document (.docx)</option><option value="jpg">Image (.jpg)</option><option value="jpeg">Image (.jpeg)</option><option value="png">Image (.png)</option></select></label>
                <label>File Size<select value={draftFilters.size || ''} onChange={(e) => setDraftFilters({ ...draftFilters, size: e.target.value })}><option value="">Any Size</option><option value="under1">Under 1 MB</option><option value="oneToTen">1 MB – 10 MB</option><option value="tenToHundred">10 MB – 100 MB</option><option value="hundredToOneGb">100 MB – 1 GB</option><option value="oneToThreeGb">1 GB – 3 GB</option></select></label>
              </div>
              <label className="filter-choice filter-checkbox"><input type="checkbox" checked={draftFilters.favorites === 'true'} onChange={(e) => setDraftFilters({ ...draftFilters, favorites: e.target.checked ? 'true' : '' })} />Favorites only</label>
            </div>
            <div className="filter-group">
              <span className="filter-group-title">Sort By</span>
              <select className="filter-sort-select" value={draftFilters.sort || 'newest'} onChange={(e) => setDraftFilters({ ...draftFilters, sort: e.target.value })}><option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="az">Name (A–Z)</option><option value="za">Name (Z–A)</option><option value="largest">Largest File</option><option value="smallest">Smallest File</option></select>
            </div>
            <div className="filter-actions"><button className="filter-reset-button" onClick={resetFilters}>Reset</button><button className="filter-apply-button" onClick={applyFilters}>Apply Filters</button></div>
          </div>
        )}
      </div>

      <div className="profile-menu" style={{ position: 'relative' }}>
        <button className="profile-avatar" onClick={() => setShowProfileMenu(!showProfileMenu)} title={user?.name || 'User Account'} style={{ cursor: 'pointer', outline: 'none' }}>{userInitial}</button>
        {showProfileMenu && <div className="dropdown-menu" style={{ right: 0, top: '54px', width: '230px' }} onMouseLeave={() => setShowProfileMenu(false)}><div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}><div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{user?.name || 'Doc User'}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div><div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}><ShieldCheck size={13} /> Encrypted Session</div></div><div className="dropdown-item dropdown-item-danger" onClick={() => { setShowProfileMenu(false); logout(); router.push('/login'); }}><LogOut size={16} /><span>Sign Out</span></div></div>}
      </div>
    </nav>
  );
};

export default Navbar;
