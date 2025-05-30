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
    console.log('Form submitted');

    const user = auth.currentUser;
    if (!user) return navigate('/login');
    console.log('Current user:', user);

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
      console.log('Writing user to Firestore...', userData);
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
                width: '180px'
              }}
            >
              <h4>{cls.label}</h4>
              <img src={cls.avatar} alt={cls.label} width="50" />
              <p>{cls.description}</p>
              <p>Starting Item: {cls.startingItem.name}</p>
            </div>
          ))}
        </div>

        <br />
        <button type="submit">🚀 Start Adventure</button>
      </form>
    </div>
  );
}

export default CharacterCreation;
