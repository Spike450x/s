import React, { useState, useMemo } from 'react';
import { rarityColors, classColors, xpBarColors } from '../utils/colors';
import statData from '../utils/statIcons';
import Tooltip from './Tooltip';
import { getEffectiveStats } from '../utils/stats';
import { useNavigate } from 'react-router-dom';

// Destructure icons and tooltip text for each stat
const { statIcons, statTooltips } = statData;

/**
 * CharacterCard component
 * 
 * Displays the user's character details including:
 * - Username and avatar
 * - Class and level
 * - Health bar (current / max)
 * - XP bar (current XP / XP needed for next level)
 * - Core stats with icons and tooltip explanations
 * - Equipped gear with rarity colors and tooltips
 * - Button navigation to Statistics page
 *
 * Props:
 * - user: object containing all character data from Firestore, e.g.:
 *   {
 *     username: string,
 *     avatar: string (URL),
 *     class: string (e.g., 'wizard'),
 *     level: number,
 *     xp: number,
 *     health: { current: number, max: number },
 *     stats: { strength: number, agility: number, endurance: number, intellect: number, vitality: number, luck: number },
 *     equipped: { weapon: {...}, armor: {...}, boots: {...}, consumable: {...} }
 *   }
 */
function CharacterCard({ user }) {
  const navigate = useNavigate(); // Hook for navigation to other routes

  // Determine border/background color based on class
  const classColor = classColors[user.class] || '#ccc';
  // Determine XP bar fill color based on class
  const xpColor = xpBarColors[user.class] || '#2196f3';

  // Calculate current XP values
  const currentXP = user.xp || 0;
  const xpNeeded = Math.floor(50 * Math.pow(user.level || 1, 2)); // XP threshold: 50 * level^2
  const xpPercentage = Math.min((currentXP / xpNeeded) * 100, 100); // Cap at 100%

  // Calculate current health values
  const currentHealth = user.health?.current ?? 0;
  const maxHealth = user.health?.max ?? 1;
  const hpPercentage = Math.min((currentHealth / maxHealth) * 100, 100);

  // Grab equipped items object (may be empty)
  const equippedItems = user.equipped || {};

  // Compute effective stats (base + gear bonuses) with useMemo to avoid recomputation unless dependencies change
  const effectiveStats = useMemo(
    () => getEffectiveStats(user.stats || {}, equippedItems),
    [user.stats, equippedItems]
  );

  // Local state to track which stat tooltip is visible
  const [visibleStat, setVisibleStat] = useState(null);
  // Local state to track which item tooltip is visible
  const [visibleTooltip, setVisibleTooltip] = useState(null);

  // Clear any open tooltips when clicking outside
  const clearTooltips = () => {
    setVisibleStat(null);
    setVisibleTooltip(null);
  };

  // Toggle a stat tooltip on or off; stop propagation so parent click won’t clear immediately
  const toggleStatTooltip = (stat, e) => {
    e.stopPropagation();
    setVisibleStat((prev) => (prev === stat ? null : stat));
  };

  // Toggle an item tooltip on or off; stop propagation likewise
  const toggleItemTooltip = (type, e) => {
    e.stopPropagation();
    setVisibleTooltip((prev) => (prev === type ? null : type));
  };

  /**
   * renderStat helper
   * Renders one stat line with icon, label, value, and a clickable tooltip.
   *
   * @param {string} stat - key name ('strength', 'agility', etc.)
   * @param {string} label - display label ('Strength', 'Agility', etc.)
   */
  const renderStat = (stat, label) => (
    <div style={{ marginBottom: '4px', position: 'relative' }}>
      <span
        style={{ fontWeight: 'bold', cursor: 'pointer' }}
        onClick={(e) => toggleStatTooltip(stat, e)}
      >
        {statIcons[stat]} {label}: {effectiveStats[stat] ?? 0}
      </span>
      {visibleStat === stat && (
        <div
          style={{ position: 'absolute', top: '-28px', left: '0' }}
          onClick={(e) => e.stopPropagation()} // Prevent clicking inside the tooltip from clearing it
        >
          <Tooltip>{statTooltips[stat]}</Tooltip>
        </div>
      )}
    </div>
  );

  /**
   * renderEquippedItem helper
   * Renders one equipped gear slot with item name, rarity color, effect, and a clickable tooltip.
   *
   * @param {string} type - slot key ('weapon', 'armor', 'boots', 'consumable')
   * @param {string} label - display label with emoji (e.g., '🗡️ Weapon')
   */
  const renderEquippedItem = (type, label) => {
    const item = equippedItems[type];
    const isVisible = visibleTooltip === type;

    return (
      <div key={type} style={{ marginBottom: '4px', position: 'relative' }}>
        <strong>{label}:</strong>{' '}
        {item ? (
          <>
            <span
              onClick={(e) => toggleItemTooltip(type, e)}
              style={{
                color: rarityColors[item.rarity?.toLowerCase()], // Color by item rarity
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              {item.name} ({item.rarity}) - {item.effect}
            </span>
            {isVisible && (
              <div
                style={{ position: 'absolute', top: '-28px', left: '0' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip>{item.description}</Tooltip>
              </div>
            )}
          </>
        ) : (
          <span style={{ color: '#888' }}>[None]</span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={clearTooltips} // Clicking container clears any open tooltips
      style={{
        border: `3px solid ${classColor}`,
        borderRadius: '12px',
        padding: '1.5rem',
        backgroundColor: `${classColor}22`, // Light tinted background
        marginBottom: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      {/* Username */}
      <h2 style={{ textAlign: 'center' }}>{user.username}</h2>
      {/* Avatar */}
      <img
        src={user.avatar}
        alt="avatar"
        width="80"
        style={{ display: 'block', margin: '10px auto' }}
      />
      {/* Class and Level */}
      <p style={{ textAlign: 'center' }}>
        🧙 {user.class.toUpperCase()} | 🏆 Level {user.level}
      </p>

      {/* Health Bar */}
      <div style={{ margin: '10px 0' }}>
        <strong>❤️ HP:</strong>
        <div
          style={{
            background: '#ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '12px',
          }}
        >
          <div
            style={{
              width: `${hpPercentage}%`,
              height: '12px',
              backgroundColor: '#e74c3c',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <small>
          {currentHealth} / {maxHealth}
        </small>
      </div>

      {/* XP Bar */}
      <div style={{ margin: '10px 0' }}>
        <strong>📈 XP:</strong>
        <div
          style={{
            background: '#ddd',
            borderRadius: '8px',
            overflow: 'hidden',
            height: '12px',
          }}
        >
          <div
            style={{
              width: `${xpPercentage}%`,
              height: '12px',
              backgroundColor: xpColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <small>
          {currentXP} / {xpNeeded} XP
        </small>
      </div>

      {/* Stats Section */}
      <h3>🧬 Stats</h3>
      {renderStat('luck', 'Luck')}
      {renderStat('endurance', 'Endurance')}
      {renderStat('intellect', 'Intellect')}
      {renderStat('vitality', 'Vitality')}
      {renderStat('agility', 'Agility')}
      {renderStat('strength', 'Strength')}

      {/* Equipped Gear Section */}
      <h3>🧤 Equipped Gear</h3>
      {renderEquippedItem('weapon', '🗡️ Weapon')}
      {renderEquippedItem('armor', '🛡️ Armor')}
      {renderEquippedItem('boots', '🥾 Boots')}
      {renderEquippedItem('consumable', '🧪 Consumable')}

      {/* Statistics Button */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={() => navigate('/stats')}>📊 View Statistics</button>
      </div>
    </div>
  );
}

export default CharacterCard;
