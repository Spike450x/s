import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import UserContext from '../../contexts/UserContext';

import CharacterCard from './CharacterCard';
import Inventory from './Inventory';

import styles from './Dashboard.module.css';
import '../../index.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, loading } = useContext(UserContext);

  // DEBUG: see whether loading/userData update
  console.log('Dashboard → loading:', loading, 'userData:', userData);

  const [showInventory, setShowInventory] = useState(false);

  // If not loading but no userData, redirect to login
  useEffect(() => {
    if (!loading && !userData) {
      navigate('/login');
    }
  }, [loading, userData, navigate]);

  // Daily stat bumps based on fitness fields
  useEffect(() => {
    if (loading || !userData) return;

    const uid = userData.uid;
    const userRef = doc(db, 'users', uid);
    const localKey = `lastDailyUpdate_${uid}`;
    const lastChecked = localStorage.getItem(localKey);
    const today = new Date().toISOString().split('T')[0];

    if (lastChecked !== today) {
      const updates = {
        lastActivity: today,
        playtime: increment(0.25),
      };

      const { fitness } = userData;
      if (fitness) {
        const bumps = {
          'stats.agility': Math.floor(fitness.miles / 5),
          'stats.strength': Math.floor(fitness.strengthSessions / 3),
          'stats.vitality': Math.floor(fitness.workouts / 4),
          'stats.intellect': Math.floor(fitness.sleepDays / 5),
          'stats.endurance': Math.floor(fitness.waterDays / 5),
          'stats.luck': Math.floor(fitness.steps / 10000),
        };
        Object.entries(bumps).forEach(([key, val]) => {
          if (val > 0) {
            updates[key] = increment(val);
          }
        });
      }

      updateDoc(userRef, updates)
        .then(() => {
          localStorage.setItem(localKey, today);
        })
        .catch((err) => {
          console.error('Error applying daily updates:', err);
        });
    }
  }, [loading, userData]);

  const handleEquip = async (item) => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);
    try {
      await updateDoc(userRef, {
        ['equipped.' + item.type.toLowerCase()]: item,
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
        ['equipped.' + slot]: null,
      });
    } catch (err) {
      console.error('Unequip failed:', err);
    }
  };

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
        <button
          onClick={() => navigate('/shop')}
          className={styles.iconButton}
          aria-label="Go to Shop"
        >
          🛒
        </button>
        <button
          onClick={() => navigate('/quests')}
          className={styles.iconButton}
          aria-label="View Quests"
        >
          📜
        </button>
        <button
          onClick={handleLogout}
          className={styles.iconButton}
          aria-label="Logout"
        >
          🔓
        </button>
      </div>

      {/* Welcome message */}
      <h1 className={styles.heroTitle}>
        Welcome back, Hero 🧙 {userData.username}
      </h1>

      {/* CharacterCard centered */}
      <div className={styles.centerWrapper}>
        <CharacterCard user={userData} />
      </div>

      {/* Show/Hide Inventory button */}
      <div className={styles.centerWrapper}>
        <button
          onClick={() => setShowInventory((prev) => !prev)}
          className={styles.inventoryToggleBtn}
        >
          <span className={styles.inventoryToggleIcon}>📦</span>
          {showInventory ? 'Hide Inventory' : 'Show Inventory'}
        </button>
      </div>

      {/* Inventory section */}
      {showInventory && (
        <div className={styles.inventoryContainer}>
          <Inventory
            items={userData.inventory || []}
            equipped={userData.equipped || {}}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
          />
        </div>
      )}
    </div>
  );
}
