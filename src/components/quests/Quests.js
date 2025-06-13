// src/components/quests/Quests.js

import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

import { getGlobalDailyQuests } from '../../utils/globalDailyUtils';
import styles from './Quests.module.css';
import '../../index.css';

function Quests() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);

  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const debounceRef = useRef(null);

  // Fetch today's 4 quests
  useEffect(() => {
    getGlobalDailyQuests()
      .then(setQuests)
      .catch((err) => {
        console.error('Failed to load daily quests:', err);
        setMessage(`⚠️ ${err.message}`);
      });
  }, []);

  // Mark which quests have been completed
  useEffect(() => {
    if (!userData || !quests.length) return;
    const doneNames = userData.questsCompleted || [];
    setCompleted(
      quests
        .filter((q) => doneNames.includes(q.name))
        .map((q) => q.id)
    );
  }, [userData, quests]);

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

      {quests.length === 0 && !message && <p>Loading quests…</p>}

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
