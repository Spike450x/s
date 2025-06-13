import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import classOptions from '../../utils/classOptions';

import styles from './CharacterCreation.module.css';
import '../../index.css';

function CharacterCreation() {
  const [username, setUsername] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate presence of both fields
    if (!username.trim() || !selectedClass) {
      setError('Please enter a character name and select a class.');
      return;
    }

    const classData = classOptions[selectedClass];
    if (!classData) {
      setError('Invalid class selection.');
      return;
    }

    const startingItem = classData.startingItem;
    const trimmedName = username.trim();

    const userData = {
      username: trimmedName,
      class: selectedClass,
      avatar: classData.avatar,
      level: 1,
      xp: 0,
      coins: 50,
      stats: classData.startingStats,
      health: { current: 100, max: 100 },
      inventory: [startingItem],
      equipped: { weapon: startingItem },
      questsCompleted: [],
      monstersDefeated: 0,
      xpHistory: [],
      questHistory: [],
      battleHistory: [],
      lastActivity: new Date().toISOString().split('T')[0],
      playtime: 0,
      fitness: {
        steps: 0,
        miles: 0,
        workouts: 0,
        strengthSessions: 0,
        sleepDays: 0,
        waterDays: 0,
      },
    };

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to create a character.');
        return navigate('/login');
      }

      await setDoc(doc(db, 'users', user.uid), userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating user doc:', err.code);
      // Simplify: only generic message here
      setError('Failed to create character. Please try again.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        🛡️ Create Your Hero
      </h2>
      <form onSubmit={handleSubmit}>
        <label className={styles.formLabel}>
          Character Name:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className={styles.formInput}
          />
        </label>

        <h3 className="text-xl font-medium mb-3">Choose a Class</h3>
        <div className={styles.classGrid}>
          {Object.entries(classOptions).map(([key, cls]) => {
            const isSelected = selectedClass === key;
            return (
              <div
                key={key}
                onClick={() => setSelectedClass(key)}
                className={`${styles.classOptionCard} ${
                  isSelected
                    ? styles.classOptionCardSelected
                    : styles.classOptionCardUnselected
                }`}
                style={
                  isSelected
                    ? { '--selected-bg': `${cls.color}22` }
                    : undefined
                }
              >
                <h4 className="text-lg font-bold">{cls.label}</h4>
                <img
                  src={cls.avatar}
                  alt={cls.label}
                  width="50"
                  className="mx-auto my-2"
                />
                <p className="mb-2">{cls.description}</p>
                <p className="font-semibold">Starting Item:</p>
                <p>
                  {cls.startingItem.name}
                  <br />
                  ({cls.startingItem.effect})
                </p>
              </div>
            );
          })}
        </div>

        {selectedClass && (
          <div className={styles.statsContainer}>
            <h4 className={styles.statsHeading}>📊 Starting Stats</h4>
            <table className={styles.statsTable}>
              <tbody>
                {Object.entries(
                  classOptions[selectedClass].startingStats
                ).map(([stat, value]) => (
                  <tr key={stat}>
                    <td className="font-bold">{stat.charAt(0).toUpperCase() + stat.slice(1)}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button type="submit" className={styles.startButton}>
          🚀 Start Adventure
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginTop: '12px', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default CharacterCreation;
