// src/components/dashboard/CharacterCard.js

import React, { useState, useMemo } from 'react';
import { rarityColors, classColors, xpBarColors } from '../../utils/colors';
import statData from '../../utils/statIcons';
// Corrected path to Tooltip
import Tooltip from '../tooltip/Tooltip';
import { getEffectiveStats } from '../../utils/stats';
import { useNavigate } from 'react-router-dom';

import styles from './CharacterCard.module.css';
import '../../index.css';

const { statIcons, statTooltips } = statData;

function CharacterCard({ user }) {
  const navigate = useNavigate();

  const classColor = classColors[user.class] || '#ccc';
  const xpColor = xpBarColors[user.class] || '#2196f3';

  const currentXP = user.xp || 0;
  const xpNeeded = Math.floor(50 * Math.pow(user.level || 1, 2));
  const xpPercentage = Math.min((currentXP / xpNeeded) * 100, 100);

  const currentHealth = user.health?.current ?? 0;
  const maxHealth = user.health?.max ?? 1;
  const hpPercentage = Math.min((currentHealth / maxHealth) * 100, 100);

  const equippedItems = user.equipped || {};

  const effectiveStats = useMemo(
    () => getEffectiveStats(user.stats || {}, equippedItems),
    [user.stats, equippedItems]
  );

  const [visibleStat, setVisibleStat] = useState(null);
  const [visibleTooltip, setVisibleTooltip] = useState(null);

  const clearTooltips = () => {
    setVisibleStat(null);
    setVisibleTooltip(null);
  };

  const toggleStatTooltip = (stat, e) => {
    e.stopPropagation();
    setVisibleStat((prev) => (prev === stat ? null : stat));
  };

  const toggleItemTooltip = (type, e) => {
    e.stopPropagation();
    setVisibleTooltip((prev) => (prev === type ? null : type));
  };

  const renderStat = (stat, label) => (
    <div className={styles.statItem}>
      <span
        className={styles.statLabel}
        onClick={(e) => toggleStatTooltip(stat, e)}
      >
        {statIcons[stat]} {label}: {effectiveStats[stat] ?? 0}
      </span>
      {visibleStat === stat && (
        <div
          className={styles.tooltipWrapper}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip>{statTooltips[stat]}</Tooltip>
        </div>
      )}
    </div>
  );

  const renderEquippedItem = (type, label) => {
    const item = equippedItems[type];
    const isVisible = visibleTooltip === type;

    return (
      <div key={type} className={styles.itemContainer}>
        <strong>{label}:</strong>{' '}
        {item ? (
          <>
            <span
              onClick={(e) => toggleItemTooltip(type, e)}
              className={styles.itemLabel}
              style={{ color: rarityColors[item.rarity?.toLowerCase()] }}
            >
              {item.name} ({item.rarity}) - {item.effect}
            </span>
            {isVisible && (
              <div
                className={styles.tooltipWrapper}
                onClick={(e) => e.stopPropagation()}
              >
                <Tooltip>{item.description}</Tooltip>
              </div>
            )}
          </>
        ) : (
          <span className={styles.noneLabel}>[None]</span>
        )}
      </div>
    );
  };

  return (
    <div
      onClick={clearTooltips}
      className={styles.container}
      style={{
        border: `3px solid ${classColor}`,
        backgroundColor: `${classColor}22`,
      }}
    >
      <h2 className="text-center">{user.username}</h2>
      <img
        src={user.avatar}
        alt="avatar"
        width="80"
        className={styles.avatar}
      />
      <p className="text-center">
        🧙 {user.class.toUpperCase()} | 🏆 Level {user.level}
      </p>

      {/* Health Bar */}
      <div className="my-2">
        <strong>❤️ HP:</strong>
        <div className={styles.barContainer}>
          <div
            className={styles.barFill}
            style={{ width: `${hpPercentage}%`, backgroundColor: '#e74c3c' }}
          />
        </div>
        <small>
          {currentHealth} / {maxHealth}
        </small>
      </div>

      {/* XP Bar */}
      <div className="my-2">
        <strong>📈 XP:</strong>
        <div className={styles.barContainer}>
          <div
            className={styles.barFill}
            style={{ width: `${xpPercentage}%`, backgroundColor: xpColor }}
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

      {/* Equipped Gear */}
      <h3>🧤 Equipped Gear</h3>
      {renderEquippedItem('weapon', '🗡️ Weapon')}
      {renderEquippedItem('armor', '🛡️ Armor')}
      {renderEquippedItem('boots', '🥾 Boots')}
      {renderEquippedItem('consumable', '🧪 Consumable')}

      {/* Button to statistics page */}
      <div className="text-center mt-4">
        <button onClick={() => navigate('/stats')}>📊 View Statistics</button>
      </div>
    </div>
  );
}

export default CharacterCard;
