import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import classOptions from '../utils/classOptions';

function CharacterCreation() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    if (!username || !selectedClass) {
      console.warn('Missing username or class');
      setError('Please enter a username and select a class.');
      return;
    }

    const user = auth.currentUser;
    console.log('Current user:', user);
    if (!user) {
      console.warn('No user logged in. Redirecting to login.');
      return navigate('/login');
    }

    const chosen = classOptions[selectedClass];
    if (!chosen) {
      console.error('Invalid class selected');
      return;
    }

    const maxHealth = 10 + chosen.startingStats.vitality * 2;
    const newUser = {
      username,
      class: selectedClass,
      stats: { ...chosen.startingStats },
      avatar: chosen.avatar,
      coins: 100,
      level: 1,
      xp: 0,
      health: {
        current: maxHealth,
        max: maxHealth
      },
      inventory: [chosen.startingItem],
      equipped: {
        weapon: chosen.startingItem.type === 'Weapon' ? chosen.startingItem : null,
        armor: null,
        boots: null,
        consumable: null
      },
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      playtime: 0
    };

    try {
      console.log('Writing user to Firestore...', newUser);
      await setDoc(doc(db, 'users', user.uid), newUser);
      console.log('User saved successfully.');
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save user:', err);
      setError('Failed to create character.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Create Your Character</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label><br />
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br /><br />

        <label>Choose a Class:</label><br />
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} required>
          <option value="">-- Select Class --</option>
          {Object.entries(classOptions).map(([key, option]) => (
            <option key={key} value={key}>{option.label}</option>
          ))}
        </select>

        {selectedClass && (
          <div style={{ marginTop: '1rem' }}>
            <h4>{classOptions[selectedClass].description}</h4>
            <ul>
              {Object.entries(classOptions[selectedClass].startingStats).map(([stat, value]) => (
                <li key={stat}>{stat.toUpperCase()}: {value}</li>
              ))}
            </ul>
            <p><strong>Starting Item:</strong> {classOptions[selectedClass].startingItem.name}</p>
            <p>{classOptions[selectedClass].startingItem.description}</p>
          </div>
        )}

        <br />
        <button type="submit">Start Adventure</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CharacterCreation;
