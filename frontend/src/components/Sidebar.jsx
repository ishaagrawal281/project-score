"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Folder, Shield } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const isActive = pathname === '/dashboard';

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
        <ul className="sidebar-menu">
          <li>
            <Link 
              href="/dashboard" 
              className={`sidebar-item-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Folder size={18} />
              <span>My Documents</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-page)', fontSize: '12px', color: 'var(--text-muted)' }}>
          <Shield size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-medium)' }}>AES-256 Secured</div>
            <span>Encrypted vault storage</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
