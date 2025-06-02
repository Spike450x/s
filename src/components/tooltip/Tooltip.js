import React from 'react';
import styles from './Tooltip.module.css';

/**
 * Tooltip component
 *
 * A simple styled tooltip box that appears above its parent element.
 */
function Tooltip({ children }) {
  return <div className={styles.tooltipBox}>{children}</div>;
}

export default Tooltip;
