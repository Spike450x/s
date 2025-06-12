// src/components/dashboard/CharacterCard.js

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../tooltip/Tooltip';
import { getEffectiveStats } from '../../utils/stats';
import { rarityColors, classColors, xpBarColors } from '../../utils/colors';
import statData from '../../utils/statIcons';
import styles from './CharacterCard.module.css';

const { statIcons, statTooltips } = statData;

function CharacterCard({ user }) {
  const navigate = useNavigate();

  // Determine class‐based colors
  const classColor = classColors[user.class] || '#ccc';
  const bgColor = `${classColor}22`;
  const xpColor = xpBarColors[user.class] || '#2196f3';

  // XP calculations
  const currentXP = user.xp || 0;
  const xpNeeded = Math.floor(50 * Math.pow(user.level || 1, 2));
  const xpPercentage = Math.min((currentXP / xpNeeded) * 100, 100);

  // HP calculations
  const currentHealth = user.health?.current ?? 0;
  const maxHealth = user.health?.max ?? 1;
  const hpPercentage = Math.min((currentHealth / maxHealth) * 100, 100);

  // Wrap the “equipped or empty object” logic in its own useMemo
  const equippedItems = useMemo(() => {
    return user.equipped || {};
  }, [user.equipped]);

  // Compute effective stats (base + gear) with useMemo
  // Now equippedItems is stable unless user.equipped changes
  const effectiveStats = useMemo(
    () => getEffectiveStats(user.stats || {}, equippedItems),
    [user.stats, equippedItems]
  );

  // Track which stat or item tooltip is visible
  const [visibleStat, setVisibleStat] = useState(null);
  const [visibleTooltip, setVisibleTooltip] = useState(null);

  const clearTooltips = () => {
    setVisibleStat(null);
    setVisibleTooltip(null);
  };

  const toggleStatTooltip = (statKey, e) => {
    e.stopPropagation();
    setVisibleStat((prev) => (prev === statKey ? null : statKey));
  };

  const toggleItemTooltip = (slot, e) => {
    e.stopPropagation();
    setVisibleTooltip((prev) => (prev === slot ? null : slot));
  };

  // Helper to render a single stat
  const renderStat = (statKey, label) => (
    <li className={styles.statItem} key={statKey}>
      <span
        className={styles.statLabel}
        onClick={(e) => toggleStatTooltip(statKey, e)}
      >
        {statIcons[statKey]} {label}: {effectiveStats[statKey] ?? 0}
      </span>
      {visibleStat === statKey && (
        <div
          className={styles.tooltipContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>{statTooltips[statKey]}</Tooltip>
        </div>
      )}
    </li>
  );

  // Helper to render one equipped slot
  const renderEquippedItem = (type, label) => {
    const item = equippedItems[type];
    const isVisible = visibleTooltip === type;

    return (
      <div className={styles.equippedItem} key={type}>
        <span className={styles.equipLabel}>{label}:</span>{' '}
        {item ? (
          <>
            <span
              className={styles.equipName}
              onClick={(e) => toggleItemTooltip(type, e)}
              style={{ color: rarityColors[item.rarity?.toLowerCase()] }}
            >
              {item.name} ({item.rarity}) – {item.effect}
            </span>
            {isVisible && (
              <div
                className={styles.tooltipContainer}
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
      onClick={clearTooltips}
      className={styles.cardContainer}
      style={{
        '--border-color': classColor,
        '--bg-color': bgColor,
      }}
    >
      {/* Username */}
      <h2 className={styles.username}>{user.username}</h2>

      {/* Avatar (now centered) */}
      <img src={user.avatar} alt="avatar" className={styles.avatar} />

      {/* Class & Level */}
      <p className={styles.classLevel}>
        🧙 {user.class.toUpperCase()} | 🏆 Level {user.level}
      </p>

      {/* Health Bar */}
      <div className={styles.barContainer}>
        <span className={styles.barLabel}>❤️ HP:</span>
        <div className={styles.barWrapper}>
          <div
            className={styles.barFill}
            style={{
              width: `${hpPercentage}%`,
              backgroundColor: '#e74c3c',
            }}
          />
        </div>
        <small>
          {currentHealth} / {maxHealth}
        </small>
      </div>

      {/* XP Bar */}
      <div className={styles.barContainer}>
        <span className={styles.barLabel}>📈 XP:</span>
        <div className={styles.barWrapper}>
          <div
            className={styles.barFill}
            style={{
              width: `${xpPercentage}%`,
              backgroundColor: xpColor,
            }}
          />
        </div>
        <small>
          {currentXP} / {xpNeeded} XP
        </small>
      </div>

      {/* Stats Section */}
      <h3 className={styles.sectionHeading}>🧬 Stats</h3>
      <ul className={styles.statsList}>
        {renderStat('luck', 'Luck')}
        {renderStat('endurance', 'Endurance')}
        {renderStat('intellect', 'Intellect')}
        {renderStat('vitality', 'Vitality')}
        {renderStat('agility', 'Agility')}
        {renderStat('strength', 'Strength')}
      </ul>

      {/* Equipped Gear Section */}
      <h3 className={styles.gearHeading}>🧤 Equipped Gear</h3>
      {renderEquippedItem('weapon', '🗡️ Weapon')}
      {renderEquippedItem('armor', '🛡️ Armor')}
      {renderEquippedItem('boots', '🥾 Boots')}
      {renderEquippedItem('consumable', '🧪 Consumable')}

      {/* View Statistics Button */}
      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={() => navigate('/stats')}>📊 View Statistics</button>
      </div>
    </div>
  );
}

export default CharacterCard;
