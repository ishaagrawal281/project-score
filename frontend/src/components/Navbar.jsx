"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, HardDrive, ShieldCheck } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const Navbar = () => {
  const { user, logout } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const searchVal = searchParams?.get('search') || '';

  const handleSearchChange = (e) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    router.push('?' + params.toString());
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
        <div className="nav-brand-icon-wrap">
          <HardDrive size={22} />
        </div>
        <span>DocVault</span>
      </div>

      <div className="search-container">
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon-left" />
          <input
            type="text"
            className="search-input"
            placeholder="Search documents by name..."
            value={searchVal}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="profile-menu" style={{ position: 'relative' }}>
        <button 
          className="profile-avatar" 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          title={user?.name || 'User Account'}
          style={{ cursor: 'pointer', outline: 'none' }}
        >
          {userInitial}
        </button>

        {showProfileMenu && (
          <div className="dropdown-menu" style={{ right: 0, top: '54px', width: '230px' }} onMouseLeave={() => setShowProfileMenu(false)}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{user?.name || 'Doc User'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>
                <ShieldCheck size={13} /> Encrypted Session
              </div>
            </div>
            <div 
              className="dropdown-item dropdown-item-danger" 
              onClick={() => {
                setShowProfileMenu(false);
                logout();
                router.push('/login');
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
