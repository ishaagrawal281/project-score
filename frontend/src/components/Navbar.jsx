"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, LogOut, HardDrive, Menu } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';

const Navbar = ({ onToggleSidebar }) => {
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
      <div className="nav-brand">
        <button 
          onClick={onToggleSidebar} 
          style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', marginRight: '8px' }}
          className="mobile-menu-btn"
        >
          <Menu size={20} className="folder-icon" style={{ color: 'var(--primary)' }} />
        </button>
        <HardDrive size={24} style={{ fill: 'rgba(15, 82, 186, 0.1)' }} />
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
          style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
        >
          {userInitial}
        </button>

        {showProfileMenu && (
          <div className="dropdown-menu" style={{ right: 0, top: '48px', width: '220px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>{user?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
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
