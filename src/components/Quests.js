import React, { useEffect, useState, useRef } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  runTransaction,
  arrayUnion,
  getDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Quests() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchCompleted = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.exists() ? snap.data() : {};
      const completedNames = data.questsCompleted || [];
      setCompleted(quests.filter(q => completedNames.includes(q.name)).map(q => q.id));
    };
    fetchCompleted();
  }, []);

  const completeQuest = async (quest) => {
    if (processing || completed.includes(quest.id)) return;
    setProcessing(true);
    setCompleted(prev => [...prev, quest.id]);
    setMessage(`✅ Completed: ${quest.name}`);

    const user = auth.currentUser;
    if (!user) return navigate('/login');
    const userRef = doc(db, 'users', user.uid);
    const now = new Date().toISOString();

    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        if (!userSnap.exists()) throw new Error('User not found');
        const data = userSnap.data();

        if ((data.questsCompleted || []).includes(quest.name)) return;

        tx.update(userRef, {
          xp: (data.xp || 0) + quest.xp,
          coins: (data.coins || 0) + quest.coins,
          questsCompleted: arrayUnion(quest.name),
          questHistory: arrayUnion({ name: quest.name, date: now }),
          xpHistory: arrayUnion({ source: quest.name, xp: quest.xp, date: now }),
        });
      });
    } catch (err) {
      console.error('⚠️ Quest failed:', err);
      setCompleted(prev => prev.filter(id => id !== quest.id));
      setMessage('⚠️ Quest failed.');
    } finally {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setProcessing(false), 1000);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>🗺️ Daily Quests</h2>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        {quests.map(quest => (
          <div key={quest.id} style={{
            width: '250px',
            padding: '15px',
            borderRadius: '8px',
            backgroundColor: completed.includes(quest.id) ? '#d4edda' : '#fff',
            border: '1px solid #ccc',
            boxShadow: '0 0 8px rgba(0,0,0,0.05)'
          }}>
            <h4>{quest.name}</h4>
            <p>🎁 Reward: {quest.xp} XP / {quest.coins} Coins</p>
            <button
              onClick={() => completeQuest(quest)}
              disabled={completed.includes(quest.id)}
              style={{ marginTop: '10px', padding: '8px 16px' }}
            >
              {completed.includes(quest.id) ? '✅ Completed' : 'Complete Quest'}
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
