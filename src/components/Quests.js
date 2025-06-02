// src/components/Quests.js

import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

function Quests() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const [completed, setCompleted] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const debounceRef = useRef(null);

  const quests = [
    { id: 1, name: 'Drink 8 cups of water', xp: 20, coins: 10 },
    { id: 2, name: 'Run 1 mile', xp: 30, coins: 15 },
    { id: 3, name: 'Sleep 7+ hours', xp: 25, coins: 12 },
    { id: 4, name: 'Do 30 pushups', xp: 35, coins: 20 },
  ];

  // Seed completed IDs from context whenever userData changes
  useEffect(() => {
    if (!userData) return;
    const completedNames = userData.questsCompleted || [];
    setCompleted(
      quests
        .filter((q) => completedNames.includes(q.name))
        .map((q) => q.id)
    );
  }, [userData]);

  const completeQuest = async (quest) => {
    if (processing || completed.includes(quest.id)) return;
    setProcessing(true);
    setCompleted((prev) => [...prev, quest.id]);
    setMessage(`✅ Completed: ${quest.name}`);

    if (!userData) return navigate('/login');
    const userRef = doc(db, 'users', userData.uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(userRef, {
        xp: increment(quest.xp),
        coins: increment(quest.coins),
        questsCompleted: arrayUnion(quest.name),
        questHistory: arrayUnion({ name: quest.name, date: now }),
        xpHistory: arrayUnion({
          source: quest.name,
          xp: quest.xp,
          date: now,
        }),
      });
      // Context listener will update userData; no need to re-read here
    } catch (err) {
      console.error('⚠️ Quest failed:', err);
      setCompleted((prev) => prev.filter((id) => id !== quest.id));
      setMessage('⚠️ Quest failed.');
    } finally {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setProcessing(false), 1000);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>🗺️ Daily Quests</h2>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {quests.map((quest) => (
          <div
            key={quest.id}
            style={{
              width: '250px',
              padding: '15px',
              borderRadius: '8px',
              backgroundColor: completed.includes(quest.id)
                ? '#d4edda'
                : '#fff',
              border: '1px solid #ccc',
              boxShadow: '0 0 8px rgba(0,0,0,0.05)',
            }}
          >
            <h4>{quest.name}</h4>
            <p>
              🎁 Reward: {quest.xp} XP / {quest.coins} Coins
            </p>
            <button
              onClick={() => completeQuest(quest)}
              disabled={completed.includes(quest.id)}
              style={{ marginTop: '10px', padding: '8px 16px' }}
            >
              {completed.includes(quest.id)
                ? '✅ Completed'
                : 'Complete Quest'}
            </button>
          </div>
        ))}
      </div>

      <p style={{ marginTop: '1rem' }}>{message}</p>
      <button onClick={() => navigate('/dashboard')}>🔙 Back to Dashboard</button>
    </div>
  );
}

export default Quests;
