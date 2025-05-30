import React from 'react';

function Equipment({ equipped }) {
  return (
    <div>
      <h3>🧤 Equipped Gear</h3>
      <ul>
        <li><strong>Weapon:</strong> {equipped.weapon?.name || 'None'}</li>
        <li><strong>Armor:</strong> {equipped.armor?.name || 'None'}</li>
        <li><strong>Boots:</strong> {equipped.boots?.name || 'None'}</li>
      </ul>
    </div>
  );
}

export default Equipment;
