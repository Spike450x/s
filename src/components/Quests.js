import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  updateDoc,
  arrayUnion,
  increment,
  getDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Quests() {
  const navigate = useNavigate();
  const [quests] = useState([
    { id: 1, name: 'Drink 8 cups of water', xp: 20, coins: 10 },
    { id: 2, name: 'Run 1 mile', xp: 30, coins: 15 },
    { id: 3, name: 'Sleep 7+ hours', xp: 25, coins: 12 },
    { id: 4, name: 'Do 30 pushups', xp: 35, coins: 20 }
  ]);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const fetchCompletedQuests = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        const data = snap.data();
        const completedNames = data.questsCompleted || [];
        const ids = quests
          .filter((q) => completedNames.includes(q.name))
          .map((q) => q.id);
        setCompleted(ids);
      }
    };

    fetchCompletedQuests();
  }, [quests]);

  const completeQuest = async (quest) => {
    const user = auth.currentUser;
    if (!user) {
      alert('You must be logged in to complete quests.');
      return navigate('/login');
    }

    if (completed.includes(quest.id)) return;

    const timestamp = new Date().toISOString();
    const userRef = doc(db, 'users', user.uid);

    try {
      await updateDoc(userRef, {
        xp: increment(quest.xp),
        coins: increment(quest.coins),
        questsCompleted: arrayUnion(quest.name),
        questHistory: arrayUnion({ name: quest.name, date: timestamp }),
        xpHistory: arrayUnion({ source: quest.name, xp: quest.xp, date: timestamp })
      });

      setCompleted((prev) => [...prev, quest.id]);
    } catch (err) {
      console.error(err);
      alert('❌ Failed to complete quest.');
    }
  };

  return (
    <div>
      <h2>🗺️ Daily Quests</h2>
      {quests.map((quest) => (
        <div
          key={quest.id}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: completed.includes(quest.id) ? '#d4edda' : '#fff'
          }}
        >
          <p><strong>{quest.name}</strong></p>
          <p>Reward: {quest.xp} XP / {quest.coins} Coins</p>
          <button
            onClick={() => completeQuest(quest)}
            disabled={completed.includes(quest.id)}
          >
            {completed.includes(quest.id) ? '✅ Completed' : 'Complete Quest'}
          </button>
        </div>
      ))}

      <br />
      <button onClick={() => navigate('/dashboard')}>
        🔙 Back to Dashboard
      </button>
    </div>
  );
}

export default Quests;
