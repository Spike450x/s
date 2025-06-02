import React from 'react';

/**
 * Tooltip component
 *
 * A simple styled tooltip box that appears above its parent element.
 * Designed to wrap any hint or description text and position it absolutely.
 *
 * Props:
 * - children: React nodes or text to display inside the tooltip
 *
 * Note: Parent container must manage relative/absolute positioning if needed.
 */
function Tooltip({ children }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.85)', // Nearly opaque black
        color: '#fff',                          // White text
        padding: '6px 10px',                   // Padding around text
        borderRadius: '4px',                   // Rounded corners
        fontSize: '12px',                      // Slightly smaller font
        position: 'absolute',                  // Positioned relative to nearest ancestor
        transform: 'translateY(-110%)',        // Move tooltip above the parent element
        whiteSpace: 'nowrap',                  // Prevent line breaks
        zIndex: 1000,                          // Ensure it appears on top
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)', // Subtle shadow for depth
      }}
    >
      {children}
    </div>
  );
}

export default Tooltip;
