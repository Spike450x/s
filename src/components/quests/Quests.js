import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

import styles from './Quests.module.css';
import '../../index.css';

/* 
  Static quest definitions moved outside component so useEffect doesn’t need to list them as dependencies 
*/
const QUEST_DEFINITIONS = [
  { id: 1, name: 'Drink 8 cups of water', xp: 20, coins: 10 },
  { id: 2, name: 'Run 1 mile',           xp: 30, coins: 15 },
  { id: 3, name: 'Sleep 7+ hours',       xp: 25, coins: 12 },
  { id: 4, name: 'Do 30 pushups',        xp: 35, coins: 20 },
];

function Quests() {
  const navigate    = useNavigate();
  const { userData } = useContext(UserContext);

  // IDs of quests the user has already completed
  const [completed,  setCompleted]  = useState([]);
  const [processing, setProcessing] = useState(false);
  const [message,    setMessage]    = useState('');
  const debounceRef = useRef(null);

  // Update completed IDs whenever userData changes
  useEffect(() => {
    if (!userData) return;
    const completedNames = userData.questsCompleted || [];
    setCompleted(
      QUEST_DEFINITIONS
        .filter(q => completedNames.includes(q.name))
        .map(q => q.id)
    );
  }, [userData]);

  const completeQuest = async (quest) => {
    if (processing || completed.includes(quest.id)) return;
    setProcessing(true);
    setCompleted(prev => [...prev, quest.id]);
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
    } catch (err) {
      console.error('⚠️ Quest failed:', err);
      setCompleted(prev => prev.filter(id => id !== quest.id));
      setMessage(`⚠️ ${err.message}`);
    } finally {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setProcessing(false), 1000);
    }
  };

  // Helper to render the requirements map
  const renderRequirements = (req = {}) => {
    const parts = Object.entries(req).map(
      ([stat, val]) => `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${val}`
    );
    return parts.join(' • ');
  };

  return (
    <div className={styles.container}>
      <h2>🗺️ Daily Quests</h2>

      <div className={styles.questGrid}>
        {QUEST_DEFINITIONS.map(quest => {
          const isDone = completed.includes(quest.id);
          return (
            <div
              key={quest.id}
              className={`${styles.questCard} ${isDone ? styles.questCardCompleted : ''}`}
            >
              <h4>{quest.name}</h4>

              {/* New: show the description */}
              <p className={styles.description}>{quest.description}</p>

              {/* New: show the requirement summary */}
              <p className={styles.requirement}>
                <strong>Requirements:</strong> {renderRequirements(quest.requirement)}
              </p>

              <p className={styles.reward}>
                🎁 Reward: {quest.xp} XP / {quest.coins} Coins
              </p>

              <button
                onClick={() => completeQuest(quest)}
                disabled={isDone}
                className={styles.questButton}
              >
                {isDone ? '✅ Completed' : 'Complete Quest'}
              </button>
            </div>
          );
        })}
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.backWrapper}>
        <button
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Quests;
