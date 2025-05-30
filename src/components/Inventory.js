import React, { useState } from 'react';
import { rarityColors } from '../utils/colors';

function Inventory({ items, equipped, onEquip, onUnequip }) {
  const [filter, setFilter] = useState('all');

  const filteredItems =
    filter === 'all' ? items : items.filter(item => item.rarity?.toLowerCase() === filter);

  const equippedIds = Object.values(equipped || {}).map(item => item?.name);

  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div>
      <h2>🎒 Inventory</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label>Filter by Rarity: </label>
        <select onChange={handleChange} value={filter}>
          <option value="all">All</option>
          {Object.keys(rarityColors).map(rarity => (
            <option key={rarity} value={rarity}>
              {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '1rem'
      }}>
        {filteredItems.map((item, idx) => (
          <div
            key={idx}
            title={item.description}
            style={{
              border: `2px solid ${rarityColors[item.rarity?.toLowerCase()] || '#999'}`,
              padding: '1rem',
              borderRadius: '8px',
              width: '180px',
              backgroundColor: '#f4f4f4',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <img src={item.icon} alt={item.name} width="40" />
            <h4 style={{ color: rarityColors[item.rarity?.toLowerCase()] }}>{item.name}</h4>
            <p>{item.effect}</p>
            <p><strong>{item.rarity}</strong> | {item.type}</p>

            {equippedIds.includes(item.name) ? (
              <button onClick={() => onUnequip(item.type.toLowerCase())}>🧹 Unequip</button>
            ) : (
              <button onClick={() => onEquip(item)}>🗡️ Equip</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inventory;
