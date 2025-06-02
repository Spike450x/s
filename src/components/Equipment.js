import React from 'react';

/**
 * Equipment component
 *
 * Displays a simple list of currently equipped gear slots.
 *
 * Props:
 * - equipped: object containing equipped items, e.g.
 *   {
 *     weapon: { name: 'Sword', ... },
 *     armor: { name: 'Leather Armor', ... },
 *     boots: { name: 'Boots', ... }
 *   }
 */
function Equipment({ equipped }) {
  return (
    <div>
      {/* Section heading for equipped gear */}
      <h3>🧤 Equipped Gear</h3>
      <ul>
        {/* If an item is equipped, show its name; otherwise show 'None' */}
        <li>
          <strong>Weapon:</strong> {equipped.weapon?.name || 'None'}
        </li>
        <li>
          <strong>Armor:</strong> {equipped.armor?.name || 'None'}
        </li>
        <li>
          <strong>Boots:</strong> {equipped.boots?.name || 'None'}
        </li>
      </ul>
    </div>
  );
}

export default Equipment;
