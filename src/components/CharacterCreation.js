// src/components/CharacterCreation.js

import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import classOptions from '../utils/classOptions';

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
      health: {
        current: 100,
        max: 100
      },
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
        waterDays: 0
      }
    };

    try {
      await setDoc(doc(db, 'users', user.uid), userData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Error creating character. Try again.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🛡️ Create Your Hero</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Character Name:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>

        <h3>Choose a Class</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {Object.entries(classOptions).map(([key, cls]) => (
            <div
              key={key}
              onClick={() => setSelectedClass(key)}
              style={{
                border: selectedClass === key ? '3px solid #3498db' : '1px solid #ccc',
                padding: '1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedClass === key ? `${cls.color}22` : '#f9f9f9',
                width: '180px',
                textAlign: 'center'
              }}
            >
              <h4>{cls.label}</h4>
              <img src={cls.avatar} alt={cls.label} width="50" />
              <p>{cls.description}</p>
              <p><strong>Starting Item:</strong></p>
              <p>
                {cls.startingItem.name}
                <br />
                ({cls.startingItem.effect})
              </p>
            </div>
          ))}
        </div>

        {selectedClass && (
          <div style={{ marginTop: '1.5rem' }}>
            <h4>📊 Starting Stats</h4>
            <table style={{ marginTop: '0.5rem', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(classOptions[selectedClass].startingStats).map(([stat, value]) => (
                  <tr key={stat}>
                    <td style={{ padding: '4px 8px', fontWeight: 'bold' }}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </td>
                    <td style={{ padding: '4px 8px' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <br />
        <button type="submit">🚀 Start Adventure</button>
      </form>
    </div>
  );
}

export default CharacterCreation;
