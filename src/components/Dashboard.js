// src/components/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';
import UserContext from '../contexts/UserContext';

import CharacterCard from './CharacterCard';
import Inventory from './Inventory';

export default function Dashboard() {
  const navigate = useNavigate();
  const { userData, loading } = useContext(UserContext);
  const [showInventory, setShowInventory] = useState(false);

  // Redirect to /login if not authenticated
  useEffect(() => {
    if (!loading && !userData) {
      navigate('/login');
    }
  }, [loading, userData, navigate]);

  // Daily update: lastActivity, playtime, and fitness‐based stat bumps
  useEffect(() => {
    if (loading || !userData) return;

    const uid = userData.uid;
    const userRef = doc(db, 'users', uid);
    const localKey = `lastDailyUpdate_${uid}`;
    const lastChecked = localStorage.getItem(localKey);
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

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

  // Equip an item: write to Firestore immediately
  const handleEquip = async (item) => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.uid);

    try {
      // Use lowercase for the slot key
      await updateDoc(userRef, {
        ['equipped.' + item.type.toLowerCase()]: item,
      });
    } catch (err) {
      console.error('Equip failed:', err);
    }
  };

  // Unequip an item: set that slot to null in Firestore
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

  // Logout
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
    <div className="w-full min-h-screen p-6 bg-gray-50 flex flex-col items-center">
      {/* Top-right navigation emojis */}
      <div className="w-full flex justify-end mb-4">
        <button
          onClick={() => navigate('/shop')}
          className="text-2xl p-2 rounded hover:bg-gray-200"
          aria-label="Go to Shop"
        >
          🛒
        </button>
        <button
          onClick={() => navigate('/quests')}
          className="text-2xl p-2 rounded hover:bg-gray-200"
          aria-label="View Quests"
        >
          📜
        </button>
        <button
          onClick={handleLogout}
          className="text-2xl p-2 rounded hover:bg-gray-200"
          aria-label="Logout"
        >
          🔓
        </button>
      </div>

      {/* Centered Welcome Message */}
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Welcome back, Hero 🧙 {userData.username}
      </h1>

      {/* Centered Character Card */}
      <div className="mb-6">
        <CharacterCard user={userData} />
      </div>

      {/* Centered Show/Hide Inventory Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowInventory((prev) => !prev)}
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          <span className="text-xl mr-2">📦</span>
          {showInventory ? 'Hide Inventory' : 'Show Inventory'}
        </button>
      </div>

      {/* Inventory Section */}
      {showInventory && (
        <div className="w-full flex justify-center mb-6">
          <div className="max-w-xl w-full">
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
