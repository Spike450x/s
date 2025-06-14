// src/components/dashboard/AttributeAllocator.js

import React from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../firebase';

export default function AttributeAllocator({ user }) {
  // Early exit if no points to spend
  if (!user.attributePoints) return null;

  // The six stats, in the desired order with emojis
  const stats = [
    { key: 'luck',      label: '🍀 Luck'      },
    { key: 'endurance', label: '🛡️ Endurance' },
    { key: 'intellect', label: '🧠 Intellect'  },
    { key: 'vitality',  label: '❤️ Vitality'   },
    { key: 'agility',   label: '🏃 Agility'    },
    { key: 'strength',  label: '💪 Strength'   },
  ];

  const handleAllocate = async (statKey) => {
    if (user.attributePoints <= 0) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      [`stats.${statKey}`]: increment(1),
      attributePoints:      increment(-1),
    });
  };

  return (
    <div style={{ textAlign: 'center', margin: '0.5rem 0' }}>
      <p>✨ Attribute Points: {user.attributePoints}</p>
      {stats.map((stat) => (
        <button
          key={stat.key}
          disabled={user.attributePoints <= 0}
          onClick={() => handleAllocate(stat.key)}
          style={{ margin: '0 4px' }}
        >
          + {stat.label}
        </button>
      ))}
    </div>
  );
}
