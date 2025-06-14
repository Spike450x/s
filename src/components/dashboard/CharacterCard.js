// src/components/dashboard/CharacterCard.js

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Tooltip from '../tooltip/Tooltip';
import { getEffectiveStats } from '../../utils/stats';
import { rarityColors, classColors, xpBarColors } from '../../utils/colors';
import statData from '../../utils/statIcons';
import styles from './CharacterCard.module.css';

import AttributeAllocator from './AttributeAllocator';
import SpellbookModal from './SpellbookModal';

const { statIcons, statTooltips } = statData;

export default function CharacterCard({ user }) {
  const navigate = useNavigate();

  // Level-up & spellbook reveal
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showSpellbookModal, setShowSpellbookModal] = useState(false);

  useEffect(() => {
    const lastSeen = parseInt(localStorage.getItem('lastSeenLevel') || user.level, 10);
    if (user.level > lastSeen) setShowLevelUp(true);
    localStorage.setItem('lastSeenLevel', user.level.toString());
    if (user.pendingSpellbookLevels?.includes(user.level)) setShowSpellbookModal(true);
  }, []);

  useEffect(() => {
    if (showLevelUp) {
      const t = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showLevelUp]);

  // Tooltip state & handlers
  const [visibleStat, setVisibleStat] = useState(null);
  const [visibleTooltip, setVisibleTooltip] = useState(null);
  const clearTooltips = () => { setVisibleStat(null); setVisibleTooltip(null); };
  const toggleStatTooltip = (key, e) => { e.stopPropagation(); setVisibleStat(prev => prev === key ? null : key); };
  const toggleItemTooltip = (slot, e) => { e.stopPropagation(); setVisibleTooltip(prev => prev === slot ? null : slot); };

  // Styling & bars
  const classColor = classColors[user.class] || '#ccc';
  const bgColor    = `${classColor}22`;
  const xpColor    = xpBarColors[user.class] || '#2196f3';

  const baseHP       = 100;
  const hpPerLevel   = 10;
  const maxHealth    = baseHP + user.level * hpPerLevel;
  const currentHealth = Math.min(user.health?.current ?? maxHealth, maxHealth);
  const hpPerc       = Math.min((currentHealth / maxHealth) * 100, 100);

  const currentXP    = user.xp || 0;
  const xpNeeded     = Math.floor(50 * Math.pow(user.level || 1, 2));
  const xpPerc       = Math.min((currentXP / xpNeeded) * 100, 100);

  const equipped     = useMemo(() => user.equipped || {}, [user.equipped]);
  const stats        = useMemo(() => getEffectiveStats(user.stats || {}, equipped), [user.stats, equipped]);

  const renderStat = (key, label) => (
    <li className={styles.statItem} key={key}>
      <span className={styles.statLabel} onClick={e => toggleStatTooltip(key, e)}>
        {statIcons[key]} {label}: {stats[key] ?? 0}
      </span>
      {visibleStat === key && (
        <div className={styles.tooltipContainer} onClick={e => e.stopPropagation()}>
          <Tooltip>{statTooltips[key]}</Tooltip>
        </div>
      )}
    </li>
  );

  const renderEquippedItem = (type, label) => {
    const item = equipped[type], active = visibleTooltip === type;
    return (
      <div className={styles.equippedItem} key={type}>
        <span className={styles.equipLabel}>{label}:</span>{' '}
        {item ? (
          <>
            <span
              className={styles.equipName}
              onClick={e => toggleItemTooltip(type, e)}
              style={{ color: rarityColors[item.rarity.toLowerCase()] }}
            >
              {item.name} ({item.rarity}) – {item.effect}
            </span>
            {active && (
              <div className={styles.tooltipContainer} onClick={e => e.stopPropagation()}>
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
    <div className={styles.cardWrapper}>
      {showLevelUp && <div className={styles.levelUpBanner}>🎉 Level {user.level} Unlocked! 🎉</div>}
      {showSpellbookModal && <SpellbookModal user={user} onClose={() => setShowSpellbookModal(false)} />}

      <div
        onClick={clearTooltips}
        className={styles.cardContainer}
        style={{ '--border-color': classColor, '--bg-color': bgColor }}
      >
        <h2 className={styles.username}>{user.username}</h2>
        <img src={user.avatar} alt="avatar" className={styles.avatar} />
        <p className={styles.classLevel}>🧙 {user.class.toUpperCase()} | 🏆 Level {user.level}</p>

        <div className={styles.barContainer}>
          <span className={styles.barLabel}>❤️ HP:</span>
          <div className={styles.barWrapper}>
            <div className={styles.barFill} style={{ width: `${hpPerc}%`, backgroundColor: '#e74c3c' }} />
          </div>
          <small>{currentHealth} / {maxHealth}</small>
        </div>

        <div className={styles.barContainer}>
          <span className={styles.barLabel}>📈 XP:</span>
          <div className={styles.barWrapper}>
            <div className={styles.barFill} style={{ width: `${xpPerc}%`, backgroundColor: xpColor }} />
          </div>
          <small>{currentXP} / {xpNeeded} XP</small>
        </div>

        <AttributeAllocator user={user} />

        <h3 className={styles.sectionHeading}>🧬 Stats</h3>
        <ul className={styles.statsList}>
          {renderStat('luck', 'Luck')}
          {renderStat('endurance', 'Endurance')}
          {renderStat('intellect', 'Intellect')}
          {renderStat('vitality', 'Vitality')}
          {renderStat('agility', 'Agility')}
          {renderStat('strength', 'Strength')}
        </ul>

        <h3 className={styles.gearHeading}>🧤 Equipped Gear</h3>
        {renderEquippedItem('weapon', '🗡️ Weapon')}
        {renderEquippedItem('armor',  '🛡️ Armor')}
        {renderEquippedItem('boots',  '🥾 Boots')}
        {renderEquippedItem('consumable', '🧪 Consumable')}

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => navigate('/stats')}>📊 View Statistics</button>
          <button onClick={() => navigate('/fitness-history')} style={{ marginLeft: '0.5rem' }}>
            📜 View Fitness History
          </button>
        </div>
      </div>
    </div>
  );
}
