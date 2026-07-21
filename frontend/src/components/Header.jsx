"use client";

import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Renders the active dashboard view title and optional breadcrumb navigation.
 */
const Header = ({ breadcrumbs = [], onNavigate }) => {
  return (
    <header className="main-header">
      <div className="breadcrumbs">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id || `crumb-${idx}`}>
              {idx > 0 && <ChevronRight size={18} className="breadcrumbs-separator" />}
              {isLast ? (
                <span className="breadcrumbs-active" style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                  {crumb.name}
                </span>
              ) : (
                <span 
                  className="breadcrumbs-link" 
                  onClick={() => onNavigate(crumb.id)}
                  style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {crumb.name}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </header>
  );
};

export default Header;
