import React, { useState, useEffect, useRef } from 'react';
import { rarityColors, classColors, xpBarColors } from '../utils/colors';
import statData from '../utils/statIcons';
import Tooltip from './Tooltip';
import { getEffectiveStats } from '../utils/stats';

const { statIcons, statTooltips } = statData;

function CharacterCard({ user }) {
  const classColor = classColors[user.class] || '#ccc';
  const xpColor = xpBarColors[user.class] || '#2196f3';

  const currentXP = user.xp || 0;
  const xpNeeded = Math.floor(50 * Math.pow(user.level || 1, 2));
  const xpPercentage = Math.min((currentXP / xpNeeded) * 100, 100);

  const currentHealth = user.health?.current ?? 0;
  const maxHealth = user.health?.max ?? 1;
  const hpPercentage = Math.min((currentHealth / maxHealth) * 100, 100);

  const equippedItems = user.equipped || {};
  const effectiveStats = getEffectiveStats(user.stats || {}, equippedItems);

  const [visibleStat, setVisibleStat] = useState(null);
  const [visibleTooltip, setVisibleTooltip] = useState(null);
  const tooltipRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        setVisibleTooltip(null);
        setVisibleStat(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTooltip = (stat) => {
    setVisibleStat(visibleStat === stat ? null : stat);
  };

  const renderStat = (stat, label) => (
    <div
      style={{ marginBottom: '4px', cursor: 'pointer', position: 'relative' }}
      onClick={() => toggleTooltip(stat)}
      ref={tooltipRef}
    >
      <span style={{ fontWeight: 'bold' }}>
        {statIcons[stat]} {label}: {effectiveStats[stat] ?? 0}
      </span>
      {visibleStat === stat && (
        <div style={{ position: 'absolute', top: '-28px', left: '0' }}>
          <Tooltip>{statTooltips[stat]}</Tooltip>
        </div>
      )}
    </div>
  );

  const renderEquippedItem = (type, label) => {
    const item = equippedItems[type];
    const isVisible = visibleTooltip === type;

    return (
      <div key={type} style={{ marginBottom: '4px', position: 'relative' }} ref={tooltipRef}>
        <strong>{label}:</strong>{' '}
        {item ? (
          <>
            <span
              onClick={() => setVisibleTooltip(isVisible ? null : type)}
              style={{
                color: rarityColors[item.rarity?.toLowerCase()],
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {item.name} ({item.rarity}) - {item.effect}
            </span>
            {isVisible && (
              <div style={{ position: 'absolute', top: '-28px', left: '0' }}>
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
    <div style={{
      border: `3px solid ${classColor}`,
      borderRadius: '12px',
      padding: '1.5rem',
      backgroundColor: `${classColor}22`,
      marginBottom: '2rem',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{ textAlign: 'center' }}>{user.username}</h2>
      <img src={user.avatar} alt="avatar" width="80" style={{ display: 'block', margin: '10px auto' }} />
      <p style={{ textAlign: 'center' }}>
        🧙 {user.class.toUpperCase()} | 🏆 Level {user.level}
      </p>

      <div style={{ margin: '10px 0' }}>
        <strong>❤️ HP:</strong>
        <div style={{ background: '#ddd', borderRadius: '8px', overflow: 'hidden', height: '12px' }}>
          <div style={{
            width: `${hpPercentage}%`,
            height: '12px',
            backgroundColor: '#e74c3c',
            transition: 'width 0.3s ease'
          }} />
        </div>
        <small>{currentHealth} / {maxHealth}</small>
      </div>

      <div style={{ margin: '10px 0' }}>
        <strong>📈 XP:</strong>
        <div style={{ background: '#ddd', borderRadius: '8px', overflow: 'hidden', height: '12px' }}>
          <div style={{
            width: `${xpPercentage}%`,
            height: '12px',
            backgroundColor: xpColor,
            transition: 'width 0.3s ease'
          }} />
        </div>
        <small>{currentXP} / {xpNeeded} XP</small>
      </div>

      <h3>🧬 Stats</h3>
      {renderStat('luck', 'Luck')}
      {renderStat('endurance', 'Endurance')}
      {renderStat('intellect', 'Intellect')}
      {renderStat('vitality', 'Vitality')}
      {renderStat('agility', 'Agility')}
      {renderStat('strength', 'Strength')}

      <h3>🧤 Equipped Gear</h3>
      {renderEquippedItem('weapon', '🗡️ Weapon')}
      {renderEquippedItem('armor', '🛡️ Armor')}
      {renderEquippedItem('boots', '🥾 Boots')}
      {renderEquippedItem('consumable', '🧪 Consumable')}

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button onClick={() => window.location.href = '/stats'}>
          📊 View Statistics
        </button>
      </div>
    </div>
  );
}

export default CharacterCard;
