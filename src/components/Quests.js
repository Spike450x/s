import React, { useEffect, useState, useRef, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';

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
  // Grab userData from context (which subscribes to Firestore document)
  const { userData } = useContext(UserContext);

  const [completed, setCompleted] = useState([]); // IDs of quests already done
  const [processing, setProcessing] = useState(false); // Disable button during update
  const [message, setMessage] = useState(''); // Feedback message
  const debounceRef = useRef(null);

  // Hardcoded array of daily quest definitions
  const quests = [
    { id: 1, name: 'Drink 8 cups of water', xp: 20, coins: 10 },
    { id: 2, name: 'Run 1 mile', xp: 30, coins: 15 },
    { id: 3, name: 'Sleep 7+ hours', xp: 25, coins: 12 },
    { id: 4, name: 'Do 30 pushups', xp: 35, coins: 20 },
  ];

  // When userData updates, seed completed[] based on questsCompleted array from Firestore
  useEffect(() => {
    if (!userData) return;
    const completedNames = userData.questsCompleted || [];
    setCompleted(
      quests
        .filter((q) => completedNames.includes(q.name))
        .map((q) => q.id)
    );
  }, [userData]);

  /**
   * completeQuest
   *
   * Marks a quest as complete: updates local state for immediate UI feedback,
   * then writes to Firestore using updateDoc to increment xp and coins,
   * and append quest name to questsCompleted, questHistory, and xpHistory arrays.
   *
   * @param {object} quest - the quest object being completed
   */
  const completeQuest = async (quest) => {
    // Prevent double-click or re-completing the same quest
    if (processing || completed.includes(quest.id)) return;

    setProcessing(true);
    setCompleted((prev) => [...prev, quest.id]);
    setMessage(`✅ Completed: ${quest.name}`);

    if (!userData) return navigate('/login');
    const userRef = doc(db, 'users', userData.uid);
    const now = new Date().toISOString();

    try {
      await updateDoc(userRef, {
        // Increment XP and coins
        xp: increment(quest.xp),
        coins: increment(quest.coins),
        // Append the quest name to completed list
        questsCompleted: arrayUnion(quest.name),
        // Add an entry for questHistory
        questHistory: arrayUnion({ name: quest.name, date: now }),
        // Add an entry for xpHistory
        xpHistory: arrayUnion({
          source: quest.name,
          xp: quest.xp,
          date: now,
        }),
      });
      // The context listener will update userData automatically—no manual fetch needed
    } catch (err) {
      console.error('⚠️ Quest failed:', err);
      // Roll back UI changes if Firestore update fails
      setCompleted((prev) => prev.filter((id) => id !== quest.id));
      setMessage('⚠️ Quest failed.');
    } finally {
      // Debounce setting processing back to false, so the button briefly remains disabled
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => setProcessing(false), 1000);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>🗺️ Daily Quests</h2>

      {/* Quest cards container */}
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
                ? '#d4edda' // Light green if completed
                : '#fff',
              border: '1px solid #ccc',
              boxShadow: '0 0 8px rgba(0,0,0,0.05)',
            }}
          >
            {/* Quest name */}
            <h4>{quest.name}</h4>
            {/* Reward info */}
            <p>
              🎁 Reward: {quest.xp} XP / {quest.coins} Coins
            </p>
            {/* Complete/Completed button */}
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

      {/* Feedback message below cards */}
      <p style={{ marginTop: '1rem' }}>{message}</p>

      {/* Back to Dashboard button */}
      <button onClick={() => navigate('/dashboard')}>🔙 Back to Dashboard</button>
    </div>
  );
}

export default Quests;
