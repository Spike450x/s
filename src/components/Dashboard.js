// src/components/Dashboard.js
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
  const navigate = useNavigate();
  const [hasUpdatedStats, setHasUpdatedStats] = useState(false);

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
        await Promise.all([
          updateDoc(userRef, {
            lastActivity: new Date().toISOString().split('T')[0],
            playtime: increment(0.25)
          }),
          updateStatsFromFitness(user.uid)
        ]);
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

      <h1 style={{ textAlign: 'center' }}>Welcome back, Hero 🧙</h1>
      <h3 style={{ textAlign: 'center' }}>{userData.username}</h3>

      <CharacterCard user={userData} />

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button onClick={() => navigate('/shop')} style={{ margin: '0 10px', padding: '10px 20px', fontSize: '16px' }}>
          🛒 Go to Shop
        </button>
        <button onClick={() => navigate('/quests')} style={{ margin: '0 10px', padding: '10px 20px', fontSize: '16px' }}>
          🗺️ View Quests
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
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
