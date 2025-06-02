import React, { useState } from 'react';
import { rarityColors } from '../utils/colors';

/**
 * Inventory component
 *
 * Displays all items in the user's inventory. Allows filtering by rarity,
 * and equips or unequips items when the corresponding button is clicked.
 *
 * Props:
 * - items: array of item objects, where each item includes at least:
 *   {
 *     id (optional),
 *     name: string,
 *     type: string (e.g., 'Weapon', 'Boots', etc.),
 *     rarity: string (e.g., 'Common', 'Rare', etc.),
 *     effect: string,
 *     icon: string (URL),
 *     description: string
 *   }
 * - equipped: object mapping slot keys ('weapon', 'armor', 'boots', etc.)
 *   to the currently equipped item object or null.
 * - onEquip: function(item) => void
 *     Called when the user clicks “Equip” on an item.
 * - onUnequip: function(slotKey: string) => void
 *     Called when the user clicks “Unequip” on an equipped item’s slot.
 */
function Inventory({ items, equipped, onEquip, onUnequip }) {
  // Local state for the rarity filter dropdown; 'all' shows every item
  const [filter, setFilter] = useState('all');

  // Update filter when the dropdown selection changes
  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div>
      {/* Title */}
      <h2>🎒 Inventory</h2>

      {/* Rarity Filter */}
      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by Rarity: </label>
        <select onChange={handleChange} value={filter}>
          <option value="all">All</option>
          {/* Build an <option> for each rarity defined in rarityColors */}
          {Object.keys(rarityColors).map((rarity) => (
            <option key={rarity} value={rarity}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Grid of Item Cards */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1rem',
        }}
      >
        {items
          // Filter items based on selected rarity; 'all' includes everything
          .filter((item) =>
            filter === 'all' ? true : item.rarity?.toLowerCase() === filter
          )
          .map((item) => {
            const slotKey = item.type.toLowerCase(); // e.g., "weapon", "boots"
            const equippedItem = equipped?.[slotKey] || null;

            // Determine if this item is currently equipped.
            // If the item has an 'id' field, compare by id; otherwise compare by name.
            const isEquipped =
              equippedItem &&
              (equippedItem.id
                ? equippedItem.id === item.id
                : equippedItem.name === item.name);

            return (
              <div
                key={item.id || item.name}
                title={item.description} // Native tooltip on hover
                style={{
                  border: `2px solid ${
                    rarityColors[item.rarity?.toLowerCase()] || '#999'
                  }`,
                  padding: '1rem',
                  borderRadius: '8px',
                  width: '180px',
                  backgroundColor: '#f4f4f4',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                {/* Item icon */}
                <img src={item.icon} alt={item.name} width="40" />

                {/* Item name, colored by rarity */}
                <h4
                  style={{
                    color: rarityColors[item.rarity?.toLowerCase()] || '#000',
                  }}
                >
                  {item.name}
                </h4>

                {/* Effect description */}
                <p>{item.effect}</p>
                <p>
                  <strong>{item.rarity}</strong> | {item.type}
                </p>

                {/* Equip / Unequip button */}
                {isEquipped ? (
                  <button onClick={() => onUnequip(slotKey)}>🧹 Unequip</button>
                ) : (
                  <button onClick={() => onEquip(item)}>🗡️ Equip</button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default Inventory;
