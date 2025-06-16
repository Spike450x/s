// src/components/dashboard/Inventory.js

import React, { useState } from 'react';
import { rarityColors } from '../../utils/colors';

import styles from './Inventory.module.css';
import '../../index.css';

/**
 * Inventory component
 *
 * Displays all items in the user's inventory. Allows filtering by rarity and type,
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
  const [rarityFilter, setRarityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleRarityChange = (e) => {
    setRarityFilter(e.target.value);
  };

  const handleTypeChange = (e) => {
    setTypeFilter(e.target.value);
  };

  // Compute filtered items based on spellbook exclusion + both filters
  const filteredItems = items
    // 1. Exclude spellbooks entirely
    .filter(item => item.type.toLowerCase() !== 'spellbook')
    // 2. Then apply rarity & type filters
    .filter(item => {
      const matchesRarity =
        rarityFilter === 'all'
          ? true
          : item.rarity?.toLowerCase() === rarityFilter;
      const matchesType =
        typeFilter === 'all'
          ? true
          : item.type.toLowerCase() === typeFilter;
      return matchesRarity && matchesType;
    });

  return (
    <div className={styles.inventoryContent}>
      <h2>🎒 Inventory</h2>

      {/* Filter section with two dropdowns, centered */}
      <div className={styles.filterSection}>
        <label style={{ marginRight: '1rem' }}>
          Filter by Rarity:{' '}
          <select onChange={handleRarityChange} value={rarityFilter}>
            <option value="all">All</option>
            {Object.keys(rarityColors).map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </option>
            ))}
          </select>
        </label>

        <label>
          Filter by Type:{' '}
          <select onChange={handleTypeChange} value={typeFilter}>
            <option value="all">All</option>
            <option value="weapon">Weapon</option>
            <option value="armor">Armor</option>
            <option value="boots">Boots</option>
            <option value="consumable">Consumable</option>
          </select>
        </label>
      </div>

      {/* If no items match both filters, show message */}
      {filteredItems.length === 0 ? (
        <p className="text-center">No items match these filters.</p>
      ) : (
        <div className={styles.itemGrid}>
          {filteredItems.map((item) => {
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
      )}
    </div>
  );
}

export default Inventory;
