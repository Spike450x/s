import React from 'react';
import styles from './Equipment.module.css';
import '../index.css'; // (only if you need global utilities here)

/**
 * Equipment component
 *
 * Displays a simple list of currently equipped gear slots.
 */
function Equipment({ equipped }) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🧤 Equipped Gear</h3>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <strong>Weapon:</strong> {equipped.weapon?.name || 'None'}
        </li>
        <li className={styles.listItem}>
          <strong>Armor:</strong> {equipped.armor?.name || 'None'}
        </li>
        <li className={styles.listItem}>
          <strong>Boots:</strong> {equipped.boots?.name || 'None'}
        </li>
      </ul>
    </div>
  );
}

export default Equipment;
