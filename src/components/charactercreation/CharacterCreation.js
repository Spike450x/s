// src/components/charactercreation/CharacterCreation.js

import React, { useState } from 'react';
import { auth, db } from '../../firebase'; // updated path
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import classOptions from '../../utils/classOptions'; // updated path

import styles from './CharacterCreation.module.css';
import '../../index.css';

function CharacterCreation() {
  const [username, setUsername] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return navigate('/login');
    if (!username || !selectedClass) return alert('Fill in all fields');

    const classData = classOptions[selectedClass];
    if (!classData) return alert('Invalid class selection');
    const startingItem = classData.startingItem;

    const userData = {
      username,
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
      await setDoc(doc(db, 'users', user.uid), userData);
      console.log('✅ Firestore document created for user:', user.uid);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating user doc:', err);
      alert('Error creating character. Try again.');
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4 text-center">🛡️ Create Your Hero</h2>
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
                className={`${
                  isSelected ? styles.classSelected : styles.classUnselected
                } ${styles.classOption}`}
                style={{
                  backgroundColor: isSelected ? `${cls.color}22` : '#f9f9f9',
                }}
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
            <table className="table-collapse w-full">
              <tbody>
                {Object.entries(classOptions[selectedClass].startingStats).map(
                  ([stat, value]) => (
                    <tr key={stat}>
                      <td className="font-bold px-4">{stat.charAt(0).toUpperCase() + stat.slice(1)}</td>
                      <td className="px-4">{value}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        <button
          type="submit"
          className="mt-6 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          🚀 Start Adventure
        </button>
      </form>
    </div>
  );
}

export default CharacterCreation;
