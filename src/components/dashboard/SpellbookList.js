// src/components/dashboard/SpellbookList.js

import React, { useState } from 'react';
import { rarityColors } from '../../utils/colors';
import styles from './SpellbookList.module.css';

export default function SpellbookList({ items }) {
  // Only show items of type 'spellbook'
  const spellbooks = (items || []).filter(i => i.type === 'spellbook');

  const [filter, setFilter] = useState('all');
  const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

  const filtered =
    filter === 'all'
      ? spellbooks
      : spellbooks.filter(sb => sb.rarity?.toLowerCase() === filter);

  return (
    <div className={styles.spellbookContent}>
      <div className={styles.filterSection}>
        <label htmlFor="rarityFilter">Filter by Rarity:&nbsp;</label>
        <select
          id="rarityFilter"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All</option>
          {rarities.map(r => (
            <option key={r} value={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.spellbookGrid}>
        {filtered.map(sb => (
          <div
            key={sb.id}
            className={styles.spellbookCard}
            style={{ borderColor: rarityColors[sb.rarity?.toLowerCase()] || '#888' }}
          >
            <img src={sb.image} alt={sb.name} />
            <h4 className={styles.spellbookName}>{sb.name}</h4>
            <p>{sb.effect}</p>
            <p><strong>{sb.rarity}</strong></p>
          </div>
        ))}

        {filtered.length === 0 && (
          <p style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            You have no spellbooks.
          </p>
        )}
      </div>
    </div>
  );
}
