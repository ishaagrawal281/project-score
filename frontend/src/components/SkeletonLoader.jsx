"use client";

import React from 'react';

/**
 * Renders glowing mock grids while assets load from the server.
 */
const SkeletonLoader = ({ type = 'card', count = 4 }) => {
  const items = Array.from({ length: count });

  if (type === 'folder') {
    return (
      <div className="folders-grid">
        {items.map((_, idx) => (
          <div key={idx} className="skeleton skeleton-folder" style={{ width: '100%' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="documents-list">
      {items.map((_, idx) => (
        <div key={idx} className="skeleton skeleton-card" style={{ width: '100%' }} />
      ))}
    </div>
  );
};

export default SkeletonLoader;
