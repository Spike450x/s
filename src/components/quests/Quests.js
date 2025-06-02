// src/components/quests/Quests.js

import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase';     // note the "../../"
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

import styles from './Quests.module.css';
// Corrected path to global index.css
import '../../index.css';

/**
 * Quests component
 *
 * Displays a list of four hardcoded daily quests. When a user completes a quest,
 * it updates Firestore to increment XP, coins, and add the quest name to both
 * questsCompleted and questHistory arrays; also adds an entry to xpHistory.
 *
 * Props: none (uses UserContext to grab userData)
 *
 * Local State:
 * - completed: array of quest IDs that have already been completed today
 * - processing: boolean that prevents double-click while a Firestore update is in progress
 * - message: feedback string shown after completing or failing a quest
 *
 * Effects:
 * - On mount or when userData changes, seed the `completed` state from userData.questsCompleted.
 */
function Quests() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);

  const [completed, setCompleted] = useState([]); // IDs of quests already done
  const [processing, setProcessing] = useState(false); // Disable button during update
  const [message, setMessage] = useState(''); // Feedback message
  const debounceRef = useRef(null);

  const quests = [
    { id: 1, name: 'Drink 8 cups of water', xp: 20, coins: 10 },
    { id: 2, name: 'Run 1 mile', xp: 30, coins: 15 },
    { id: 3, name: 'Sleep 7+ hours', xp: 25, coins: 12 },
    { id: 4, name: 'Do 30 pushups', xp: 35, coins: 20 },
  ];

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
    <div className={styles.container}>
      <h2>🗺️ Daily Quests</h2>

      <div className={styles.questGrid}>
        {quests.map((quest) => {
          const isDone = completed.includes(quest.id);
          return (
            <div
              key={quest.id}
              className={`${styles.questCard} ${
                isDone ? styles.questCardCompleted : ''
              }`}
            >
              <h4>{quest.name}</h4>
              <p>
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
