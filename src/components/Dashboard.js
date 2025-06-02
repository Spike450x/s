import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import UserContext from '../contexts/UserContext';

import CharacterCard from './CharacterCard';
import Inventory from './Inventory';

/**
 * Dashboard component
 *
 * Main landing page after login/character creation. Displays:
 * - Top-right navigation buttons (Shop, Quests, Logout)
 * - Welcome message with character name
 * - Centered CharacterCard
 * - Show/Hide Inventory button
 * - Inventory list (if toggled)
 *
 * Data Source:
 * - userData and loading state come from UserContext, which subscribes to Firestore
 *
 * On mount / when userData changes:
 * - If not authenticated (loading false & no userData), redirect to /login
 * - Once userData is loaded, perform daily updates (lastActivity, playtime)
 *   and apply stat bumps based on previous day's fitness values
 *
 * Props: none (uses context)
 */
export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, loading } = useContext(UserContext); // Get Firestore-synced userData
  const [showInventory, setShowInventory] = useState(false); // Toggle for inventory panel

  // Redirect to /login if user is not authenticated after loading completes
  useEffect(() => {
    if (!loading && !userData) {
      navigate('/login');
    }
  }, [loading, userData, navigate]);

  /**
   * Daily update effect
   *
   * Once userData is available, check localStorage for lastDailyUpdate_<uid>.
   * If date is not today, update Firestore fields:
   *  - lastActivity => today’s date (YYYY-MM-DD)
   *  - playtime => increment by 0.25 hours
   *  - stats.* => increment based on fitness values:
   *      - agility += floor(miles / 5)
   *      - strength += floor(strengthSessions / 3)
   *      - vitality += floor(workouts / 4)
   *      - intellect += floor(sleepDays / 5)
   *      - endurance += floor(waterDays / 5)
   *      - luck += floor(steps / 10000)
   * After updating Firestore, write today’s date into localStorage to avoid repeating until tomorrow.
   */
  useEffect(() => {
    if (loading || !userData) return;

    const uid = userData.uid;
    const userRef = doc(db, 'users', uid);
    const localKey = `lastDailyUpdate_${uid}`;
    const lastChecked = localStorage.getItem(localKey);
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (lastChecked !== today) {
      const updates = {
        lastActivity: today,
        playtime: increment(0.25), // Add a quarter-hour (~15 minutes)
      };

      // Gather fitness values from userData
      const { fitness } = userData;
      if (fitness) {
        // Calculate stat bumps based on fitness metrics
        const bumps = {
          'stats.agility': Math.floor(fitness.miles / 5),
          'stats.strength': Math.floor(fitness.strengthSessions / 3),
          'stats.vitality': Math.floor(fitness.workouts / 4),
          'stats.intellect': Math.floor(fitness.sleepDays / 5),
          'stats.endurance': Math.floor(fitness.waterDays / 5),
          'stats.luck': Math.floor(fitness.steps / 10000),
        };
        // Only include increments > 0
        Object.entries(bumps).forEach(([key, val]) => {
          if (val > 0) {
            updates[key] = increment(val);
          }
        });
      }

      // Apply updates to Firestore
      updateDoc(userRef, updates)
        .then(() => {
          localStorage.setItem(localKey, today);
        })
        .catch((err) => {
          console.error('Error applying daily updates:', err);
        });
    }
  }, [loading, userData]);

  /**
   * handleEquip
   * Called when user clicks “Equip” on an Inventory item.
   * Updates the Firestore field 'equipped.<itemType>' to the item object.
   *
   * @param {object} item - item object containing at least { type }
   */
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

  /**
   * handleUnequip
   * Called when user clicks “Unequip” on an Inventory item.
   * Updates the Firestore field 'equipped.<slot>' to null.
   *
   * @param {string} slot - one of 'weapon', 'armor', 'boots', 'consumable'
   */
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

  /**
   * handleLogout
   * Signs the user out via Firebase Auth and redirects to /login.
   */
  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // While loading or no userData, show a loading message
  if (loading || !userData) {
    return <div style={{ textAlign: 'center', padding: '1rem' }}>Loading your hero…</div>;
  }

  return (
    <div
      style={{
        boxSizing: 'border-box',
        minHeight: '100vh',
        padding: '1.5rem',
        backgroundColor: '#f9fafb',
        overflowX: 'hidden', // Prevent horizontal scroll
      }}
    >
      {/* Top-right navigation emojis: Shop, Quests, Logout */}
      <div
        style={{
          maxWidth: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        {/* Shop button */}
        <button
          onClick={() => navigate('/shop')}
          style={{
            fontSize: '1.75rem',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
          aria-label="Go to Shop"
        >
          🛒
        </button>
        {/* Quests button */}
        <button
          onClick={() => navigate('/quests')}
          style={{
            fontSize: '1.75rem',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
          aria-label="View Quests"
        >
          📜
        </button>
        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{
            fontSize: '1.75rem',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            background: 'transparent',
            cursor: 'pointer',
          }}
          aria-label="Logout"
        >
          🔓
        </button>
      </div>

      {/* Centered Welcome Message */}
      <h1
        style={{
          width: '100%',
          textAlign: 'center',
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
        }}
      >
        Welcome back, Hero 🧙 {userData.username}
      </h1>

      {/* Centered Character Card */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <CharacterCard user={userData} />
      </div>

      {/* Centered Show/Hide Inventory Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setShowInventory((prev) => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.5rem 1rem',
            backgroundColor: '#1f2937',
            color: '#fff',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            border: 'none',
            fontSize: '1rem',
          }}
        >
          <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>📦</span>
          {showInventory ? 'Hide Inventory' : 'Show Inventory'}
        </button>
      </div>

      {/* Inventory Section (conditionally rendered) */}
      {showInventory && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ maxWidth: '40rem', width: '100%' }}>
            <Inventory
              items={userData.inventory || []}
              equipped={userData.equipped || {}}
              onEquip={handleEquip}
              onUnequip={handleUnequip}
            />
          </div>
        </div>
      )}
    </div>
  );
}
