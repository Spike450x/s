// src/components/dashboard/Inventory.js

import React, { useState } from 'react';
import { rarityColors } from '../../utils/colors';

import styles from './Inventory.module.css';
import '../../index.css';

/**
 * Inventory component
 *
 * Displays all items in the user's inventory. Allows filtering by rarity,
 * and equips or unequips items when the corresponding button is clicked.
 *
 * Props:
 * - items: array of item objects
 * - equipped: object mapping slot keys ('weapon', 'armor', 'boots', etc.)
 *   to the currently equipped item object or null.
 * - onEquip: function(item) => void
 * - onUnequip: function(slotKey: string) => void
 */
function Inventory({ items, equipped, onEquip, onUnequip }) {
  const [filter, setFilter] = useState('all');

  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div className={styles.inventoryContent}>
      <h2>🎒 Inventory</h2>

      {/* Centered filter section */}
      <div className={styles.filterSection}>
        <label>Filter by Rarity: </label>
        <select onChange={handleChange} value={filter}>
          <option value="all">All</option>
          {Object.keys(rarityColors).map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Shrink-wrap and center the grid of item cards */}
      <div className={styles.itemGrid}>
        {items
          .filter((item) =>
            filter === 'all'
              ? true
              : item.rarity?.toLowerCase() === filter
          )
          .map((item) => {
            const slotKey = item.type.toLowerCase();
            const equippedItem = equipped?.[slotKey] || null;

            // Determine if this item is currently equipped
            const isEquipped =
              equippedItem &&
              (equippedItem.id
                ? equippedItem.id === item.id
                : equippedItem.name === item.name);

            return (
              <div
                key={item.id || item.name}
                title={item.description}
                className={styles.itemCard}
                style={{
                  border: `2px solid ${
                    rarityColors[item.rarity?.toLowerCase()] || '#999'
                  }`,
                }}
              >
                <img src={item.icon} alt={item.name} width="40" />
                <h4
                  className={styles.itemName}
                  style={{
                    color:
                      rarityColors[item.rarity?.toLowerCase()] || '#000',
                  }}
                >
                  {item.name}
                </h4>
                <p>{item.effect}</p>
                <p>
                  <strong>{item.rarity}</strong> | {item.type}
                </p>

                {isEquipped ? (
                  <button
                    onClick={() => onUnequip(slotKey)}
                    className={styles.itemButton}
                  >
                    🧹 Unequip
                  </button>
                ) : (
                  <button
                    onClick={() => onEquip(item)}
                    className={styles.itemButton}
                  >
                    🗡️ Equip
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Inventory;
