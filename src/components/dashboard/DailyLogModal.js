import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import DailyLog from '../DailyLog';
import './DailyLogModal.css';

export default function DailyLogModal({ isOpen, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="dlm-overlay" onClick={onClose}>
      <div className="dlm-content" onClick={(e) => e.stopPropagation()}>
        <button className="dlm-close" onClick={onClose}>×</button>
        <h2 className="dlm-title">📋 Log Your Daily Stats</h2>
        <DailyLog />
      </div>
    </div>,
    document.body
  );
}
