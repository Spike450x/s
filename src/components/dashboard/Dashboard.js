// src/components/dashboard/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import UserContext from '../../contexts/UserContext';

import CharacterCard from './CharacterCard';
import Inventory from './Inventory';
import SpellbookList from './SpellbookList';
import DailyLogModal from './DailyLogModal';
import ProfileSettingsModal from './ProfileSettingsModal';

import styles from './Dashboard.module.css';
import '../../index.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, loading } = useContext(UserContext);

  const [showInventory, setShowInventory]   = useState(false);
  const [showSpellbooks, setShowSpellbooks] = useState(false);
  const [isDailyLogOpen, setIsDailyLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !userData) navigate('/login');
  }, [loading, userData, navigate]);

  // Daily stat bumps based on fitness fields
  useEffect(() => {
    if (loading || !userData) return;

    const uid      = userData.uid;
    const userRef  = doc(db, 'users', uid);
    const localKey = `lastDailyUpdate_${uid}`;
    const lastDate = localStorage.getItem(localKey);
    const today    = new Date().toISOString().split('T')[0];

    if (lastDate !== today) {
      const updates = { lastActivity: today, playtime: increment(0.25) };
      const { fitness } = userData;
      if (fitness) {
        const bumps = {
          'stats.agility':   Math.floor(fitness.miles / 5),
          'stats.strength':  Math.floor(fitness.strengthSessions / 3),
          'stats.vitality':  Math.floor(fitness.workouts / 4),
          'stats.intellect': Math.floor(fitness.sleepDays   / 5),
          'stats.endurance': Math.floor(fitness.waterDays   / 5),
          'stats.luck':      Math.floor(fitness.steps       / 10000),
        };
        Object.entries(bumps).forEach(([k, v]) => {
          if (v > 0) updates[k] = increment(v);
        });
      }
      updateDoc(userRef, updates)
        .then(() => localStorage.setItem(localKey, today))
        .catch(err => console.error('Error applying daily updates:', err));
    }
  }, [loading, userData]);

  // Toggle handlers: only one dropdown open at a time
  const handleToggleInventory = () => {
    setShowInventory(prev => {
      const newState = !prev;
      if (newState) setShowSpellbooks(false);
      return newState;
    });
  };
  const handleToggleSpellbooks = () => {
    setShowSpellbooks(prev => {
      const newState = !prev;
      if (newState) setShowInventory(false);
      return newState;
    });
  };

  // Equip/unequip handlers
  const handleEquip = async (item) => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    try {
      await updateDoc(userRef, {
        [`equipped.${item.type.toLowerCase()}`]: item,
      });
    } catch (err) {
      console.error('Equip failed:', err);
    }
  };

  const handleUnequip = async (slot) => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    try {
      await updateDoc(userRef, {
        [`equipped.${slot}`]: null,
      });
    } catch (err) {
      console.error('Unequip failed:', err);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading || !userData) {
    return <div className="text-center p-4">Loading your hero…</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 overflow-x-hidden">
      {/* Top-right nav buttons */}
      <div className={styles.navBar}>
        <button onClick={() => navigate('/shop')}       className={styles.iconButton} title="Arcane Shop">🛒</button>
        <button onClick={() => navigate('/quests')}     className={styles.iconButton} title="Daily Quests">📜</button>
        <button onClick={() => setIsDailyLogOpen(true)} className={styles.iconButton} title="Daily Log">📋</button>
        <button onClick={() => setIsSettingsOpen(true)} className={styles.iconButton} title="Settings">⚙️</button>
        <button onClick={handleLogout}                  className={styles.iconButton} title="Logout">🔓</button>
      </div>

      {/* Modals */}
      <DailyLogModal           isOpen={isDailyLogOpen} onClose={() => setIsDailyLogOpen(false)} />
      <ProfileSettingsModal    isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Welcome message */}
      <h1 className={styles.heroTitle}>Welcome Back, Hero 🧙</h1>

      {/* CharacterCard centered */}
      <div className={styles.centerWrapper}>
        <CharacterCard user={userData} />
      </div>

      {/* Show/Hide Inventory & Spellbooks */}
      <div className={styles.centerWrapper}>
        <button onClick={handleToggleInventory} className={styles.inventoryToggleBtn}>
          <span className={styles.inventoryToggleIcon}>📦</span>
          {showInventory ? 'Hide Inventory' : 'Show Inventory'}
        </button>
        <button onClick={handleToggleSpellbooks} className={styles.inventoryToggleBtn} style={{ marginLeft: '1rem' }}>
          <span className={styles.inventoryToggleIcon}>📜</span>
          {showSpellbooks ? 'Hide Spellbooks' : 'Show Spellbooks'}
        </button>
      </div>

      {showInventory && (
        <div className={styles.inventoryContainer}>
          <Inventory
            items={userData.inventory     || []}
            equipped={userData.equipped    || {}}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        </div>
      )}

      {showSpellbooks && (
        <div className={styles.inventoryContainer}>
          <SpellbookList items={userData.inventory || []} />
        </div>
      )}
    </div>
  );
}
