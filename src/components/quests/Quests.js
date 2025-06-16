// src/components/quests/Quests.js

import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, getDoc, runTransaction, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';

import { getGlobalDailyQuests } from '../../utils/globalDailyUtils';
import { updateXPAndLevel } from '../../utils/updateXPAndLevel';
import { getRandomSpellbookOptions } from '../../utils/spellbookUtils';
import SpellbookChoiceModal from './SpellbookChoiceModal';

import styles from './Quests.module.css';
import '../../index.css';

export default function Quests() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);

  const [quests, setQuests] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

  // Popup state
  const [popupQuest, setPopupQuest] = useState('');
  const [popupUnmet, setPopupUnmet] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const debounceRef = useRef(null);
  const [pendingSpellbooks, setPendingSpellbooks] = useState([]);
  const [spellbookLevel, setSpellbookLevel] = useState(null);
  const [showSpellModal, setShowSpellModal] = useState(false);

  useEffect(() => {
    getGlobalDailyQuests()
      .then(setQuests)
      .catch(err => {
        console.error('Failed to load daily quests:', err);
        setMessage(`⚠️ ${err.message}`);
      });
  }, []);

  useEffect(() => {
    if (!userData || quests.length === 0) return;
    const done = userData.questsCompleted || [];
    setCompleted(quests.filter(q => done.includes(q.name)).map(q => q.id));
  }, [userData, quests]);

  function getLoggedValue(fitness, reqKey) {
    const lowerReq = reqKey.toLowerCase();
    if (lowerReq.includes('sleep')) {
      const sleepKey = Object.keys(fitness).find(k =>
        k.toLowerCase().includes('sleep')
      );
      if (sleepKey) return fitness[sleepKey];
    }
    const exactKey = Object.keys(fitness).find(
      k => k.toLowerCase() === lowerReq
    );
    if (exactKey) {
      const val = fitness[exactKey];
      if (lowerReq === 'workouts' && val && typeof val === 'object') {
        return Object.keys(val).length;
      }
      return val;
    }
    if (lowerReq === 'water') {
      if (fitness.waterOunces != null) return fitness.waterOunces;
      if (fitness.waterIntake != null) return fitness.waterIntake;
    }
    return 0;
  }

  const completeQuest = async quest => {
    if (processing || completed.includes(quest.id)) return;
    setProcessing(true);
    if (!userData) { navigate('/login'); return; }

    const today = new Date().toISOString().split('T')[0];
    let logSnap = null;
    for (const sub of ['dailylogs','dailyLogs']) {
      const snap = await getDoc(doc(db,'users',userData.uid,sub,today));
      if (snap.exists()) { logSnap = snap; break; }
    }
    if (!logSnap) {
      setPopupQuest('');
      setPopupUnmet([{ label:'', need:'', actual:'', text:'Please log your stats for today before completing any quests.' }]);
      setShowPopup(true);
      setProcessing(false);
      return;
    }
    const fitness = logSnap.data();

    const unmet = Object.entries(quest.requirement || {})
      .map(([key, need]) => {
        const actual = getLoggedValue(fitness, key) ?? 0;
        const label = key === 'sleepHours'
          ? 'Sleep'
          : key.charAt(0).toUpperCase() + key.slice(1);
        return { label, need, actual };
      })
      .filter(x => x.actual < x.need);

    if (unmet.length) {
      setPopupQuest(quest.name);
      setPopupUnmet(unmet);
      setShowPopup(true);
      setProcessing(false);
      return;
    }

    setCompleted(prev => [...prev, quest.id]);
    const now = new Date().toISOString();
    const userRef = doc(db,'users',userData.uid);

    try {
      await runTransaction(db, async tx => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error('User not found');
        const data = snap.data();
        tx.update(userRef, {
          coins: (data.coins||0) + quest.coins,
          questsCompleted: arrayUnion(quest.name),
          questHistory: arrayUnion({ name: quest.name, date: now }),
          xpHistory: arrayUnion({ source: quest.name, xp: quest.xp, date: now }),
        });
      });

      const { leveledUp, level, attributePointsToAdd } =
        await updateXPAndLevel(userData.uid, quest.xp);

      if (leveledUp) {
        setMessage(`🎉 Level ${level} unlocked! +${attributePointsToAdd} attribute point(s)`);
        setPendingSpellbooks(getRandomSpellbookOptions(3));
        setSpellbookLevel(level);
        setShowSpellModal(true);
      } else {
        setMessage(`✅ +${quest.xp} XP`);
      }
    } catch (err) {
      console.error('Quest failed', err);
      setCompleted(prev => prev.filter(id => id !== quest.id));
      setMessage(`⚠️ ${err.message}`);
    } finally {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setProcessing(false), 1000);
    }
  };

  const renderRequirements = req =>
    Object.entries(req || {})
      .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${v}`)
      .join(' • ');

  return (
    <div className={styles.container}>
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupContainer}>
            <div className={styles.popupIcon} role="img" aria-label="warning">
              ⚠️
            </div>
            {popupQuest && (
              <p className={styles.popupTitle}>
                Cannot complete "<strong>{popupQuest}</strong>".
              </p>
            )}
            {popupUnmet.map((u, i) => (
              <div key={i} className={styles.popupReqBlock}>
                <p className={styles.popupReqLabel}>{u.label}</p>
                <p className={styles.popupReqDetail}>Need: {u.need}</p>
                <p className={styles.popupReqDetail}>Actual: {u.actual}</p>
              </div>
            ))}
            <button onClick={() => setShowPopup(false)} className={styles.popupClose}>
              Close
            </button>
          </div>
        </div>
      )}

      <h2>🗺️ Daily Quests</h2>
      {quests.length === 0 && !message && <p>Loading quests…</p>}

      <div className={styles.questGrid}>
        {quests.map(q => {
          const done = completed.includes(q.id);
          return (
            <div
              key={q.id}
              className={`${styles.questCard} ${done ? styles.questCardCompleted : ''}`}
            >
              <h4>{q.name}</h4>
              <p className={styles.description}>{q.description}</p>
              <p className={styles.requirement}>
                <strong>Requirements:</strong> {renderRequirements(q.requirement)}
              </p>
              <p className={styles.reward}>
                🎁 Reward: {q.xp} XP / {q.coins} Coins
              </p>
              <button onClick={() => completeQuest(q)}
                disabled={done}
                className={styles.questButton}
              >
                {done ? '✅ Completed' : 'Complete Quest'}
              </button>
            </div>
          );
        })}
      </div>

      {message && <p className={styles.message}>{message}</p>}

      <div className={styles.backWrapper}>
        <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
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
