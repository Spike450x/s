// src/components/quests/Quests.js

import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, runTransaction, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

import { getGlobalDailyQuests } from '../../utils/globalDailyUtils';
import { updateXPAndLevel } from '../../utils/updateXPAndLevel';
import { getRandomSpellbookOptions } from '../../utils/spellbookUtils';
import SpellbookChoiceModal from './SpellbookChoiceModal';

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

  // Spellbook‐selection state
  const [pendingSpellbooks, setPendingSpellbooks] = useState([]);
  const [spellbookLevel, setSpellbookLevel] = useState(null);
  const [showSpellModal, setShowSpellModal] = useState(false);

  // Fetch today's quests
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
    if (!userData || quests.length === 0) return;
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

    if (!userData) {
      navigate('/login');
      return;
    }
    const userRef = doc(db, 'users', userData.uid);
    const now = new Date().toISOString();

    try {
      // 1) update coins & quest history
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error('User not found');
        const data = snap.data();
        tx.update(userRef, {
          coins: (data.coins || 0) + quest.coins,
          questsCompleted: arrayUnion(quest.name),
          questHistory: arrayUnion({ name: quest.name, date: now }),
          xpHistory: arrayUnion({
            source: quest.name,
            xp: quest.xp,
            date: now,
          }),
        });
      });

      // 2) update XP, level, attribute points, and flag spellbook pick
      const {
        leveledUp,
        level,
        attributePointsToAdd,
        newSpellbookLevels,
      } = await updateXPAndLevel(userData.uid, quest.xp);

      // 3) UI feedback & possibly show spellbook modal
      if (leveledUp) {
        setMessage(
          `🎉 Level ${level} unlocked! +${attributePointsToAdd} attribute point(s)`
        );
        // Pick 3 random spellbooks
        setPendingSpellbooks(getRandomSpellbookOptions(3));
        setSpellbookLevel(level);
        setShowSpellModal(true);
      } else {
        setMessage(`✅ +${quest.xp} XP`);
      }
    } catch (err) {
      console.error('⚠️ Quest failed:', err);
      setCompleted((prev) => prev.filter((id) => id !== quest.id));
      setMessage(`⚠️ ${err.message}`);
    } finally {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setProcessing(false), 1000);
    }
  };

  const renderRequirements = (req = {}) =>
    Object.entries(req)
      .map(
        ([stat, val]) =>
          `${stat.charAt(0).toUpperCase() + stat.slice(1)}: ${val}`
      )
      .join(' • ');

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
              <p className={styles.description}>{quest.description}</p>
              <p className={styles.requirement}>
                <strong>Requirements:</strong>{' '}
                {renderRequirements(quest.requirement)}
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

      {showSpellModal && (
        <SpellbookChoiceModal
          userId={userData.uid}
          level={spellbookLevel}
          options={pendingSpellbooks}
          onClose={() => {
            setShowSpellModal(false);
            setPendingSpellbooks([]);
            setSpellbookLevel(null);
          }}
        />
      )}
    </div>
  );
}

export default Quests;
