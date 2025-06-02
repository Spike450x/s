import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import CharacterCard from './CharacterCard';
import Inventory from './Inventory';
import { updateStatsFromFitness } from '../utils/updateStatsFromFitness';

function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [showInventory, setShowInventory] = useState(false);
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return navigate('/login');

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, async (snap) => {
      if (!snap.exists()) {
        console.warn('No user document found. Redirecting...');
        return navigate('/character-creation');
      }

      const data = snap.data();
      setUserData({ ...data, id: user.uid });

      if (!hasUpdatedStats) {
        setHasUpdatedStats(true);
        const today = new Date().toISOString().split('T')[0];

        const updateFields = {};
        if (data.lastActivity !== today) {
          updateFields.lastActivity = today;
          updateFields.playtime = increment(0.25);
        }

        if (Object.keys(updateFields).length > 0) {
          await updateDoc(userRef, updateFields);
        }

        await updateStatsFromFitness(user.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate, hasUpdatedStats]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleEquip = async (item) => {
    const type = item.type.toLowerCase();
    const userRef = doc(db, 'users', userData.id);
    await updateDoc(userRef, {
      [`equipped.${type}`]: item
    });
  };

  const handleUnequip = async (type) => {
    const userRef = doc(db, 'users', userData.id);
    await updateDoc(userRef, {
      [`equipped.${type}`]: null
    });
  };

  if (!userData) return <p>Loading your character...</p>;

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px 14px',
          fontSize: '14px',
          backgroundColor: '#e74c3c',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        🔒 Logout
      </button>

      {/* Top Right Nav Buttons (Shop, Quests) */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '120px',
        display: 'flex',
        gap: '10px'
      }}>
        <button onClick={() => navigate('/shop')}>🛒 Shop</button>
        <button onClick={() => navigate('/quests')}>🗺️ Quests</button>
      </div>

      <h1 style={{ textAlign: 'center' }}>Welcome back, Hero 🧙</h1>
      <h3 style={{ textAlign: 'center' }}>{userData.username}</h3>

      <CharacterCard user={userData} />

      {/* Inventory Toggle - now inside Card Area */}
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        <button onClick={() => setShowInventory(!showInventory)} style={{ marginTop: '10px' }}>
          {showInventory ? '🧰 Hide Inventory' : '🧰 Show Inventory'}
        </button>
      </div>

      <div
        style={{
          maxHeight: showInventory ? '1000px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.5s ease'
        }}
      >
        <Inventory
          items={userData.inventory || []}
          equipped={userData.equipped || {}}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
        />
      </div>
    </div>
  );
}

export default Dashboard;
