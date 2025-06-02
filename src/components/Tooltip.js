// src/components/Tooltip.js

import React from 'react';

function Tooltip({ children }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '12px',
        position: 'absolute',
        transform: 'translateY(-110%)',
        whiteSpace: 'nowrap',
        zIndex: 1000,
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
      }}
    >
      {children}
    </div>
  );
}

export default Tooltip;
