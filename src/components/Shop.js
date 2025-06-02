// src/components/Shop.js

import React, { useEffect, useState, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import itemIcons from '../utils/itemIcons';
import { rarityColors } from '../utils/colors';

const coinIcon = 'https://img.icons8.com/emoji/48/coin-emoji.png';

const SHOP_ITEMS = [
  {
    id: 'sword_of_flame',
    name: 'Sword of Flame',
    type: 'Weapon',
    rarity: 'Epic',
    effect: '+5 Strength',
    stat: 'strength',
    bonus: 5,
    price: 50,
    description: 'A blazing sword that grants immense power.',
    icon: itemIcons.sword,
  },
  {
    id: 'boots_of_wind',
    name: 'Boots of Wind',
    type: 'Boots',
    rarity: 'Rare',
    effect: '+3 Agility',
    stat: 'agility',
    bonus: 3,
    price: 30,
    description: 'Swift boots that enhance your speed.',
    icon: itemIcons.boots,
  },
  {
    id: 'potion_of_might',
    name: 'Potion of Might',
    type: 'Consumable',
    rarity: 'Common',
    effect: '+2 Strength (1-time use)',
    stat: 'strength',
    bonus: 2,
    price: 15,
    description: 'A one-time potion to boost your might.',
    icon: itemIcons.potion,
  },
];

function Shop() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [message, setMessage] = useState('');

  // Initialize purchasedIds when userData loads or changes
  useEffect(() => {
    if (!userData) return;
    const inventory = userData.inventory || [];
    setPurchasedIds(inventory.map((item) => item.id));
  }, [userData]);

  const buyItem = async (item) => {
    if (!userData || purchasedIds.includes(item.id)) return;

    if ((userData.coins || 0) < item.price) {
      setMessage('❌ Not enough coins!');
      return;
    }

    // Optimistic UI update
    setPurchasedIds((prev) => [...prev, item.id]);
    setMessage(`✅ Bought ${item.name}`);

    const userRef = doc(db, 'users', userData.uid);

    try {
      await updateDoc(userRef, {
        coins: increment(-item.price),
        inventory: arrayUnion(item),
      });
      // Rely on UserContext to update userData.coins & userData.inventory
    } catch (err) {
      console.error('❌ Failed to buy:', err);
      // Rollback local state if Firestore fails
      setPurchasedIds((prev) => prev.filter((id) => id !== item.id));
      setMessage('⚠️ Purchase failed.');
    }
  };

  if (!userData) return <p>Loading shop...</p>;

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>🛒 Shop</h2>
      <p style={{ textAlign: 'center' }}>💰 Coins: {userData.coins || 0}</p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        {SHOP_ITEMS.map((item) => (
          <div
            key={item.id}
            style={{
              width: '220px',
              padding: '12px',
              border: `3px solid ${
                rarityColors[item.rarity.toLowerCase()] || '#ccc'
              }`,
              borderRadius: '10px',
              backgroundColor: '#fff',
              textAlign: 'center',
            }}
          >
            <img src={item.icon} alt={item.name} width="40" />
            <h3 style={{ margin: '10px 0 5px' }}>{item.name}</h3>
            <p
              style={{
                margin: '0',
                fontWeight: 'bold',
                color: rarityColors[item.rarity.toLowerCase()],
              }}
            >
              {item.rarity.toUpperCase()}
            </p>
            <p style={{ marginTop: '8px' }}>{item.description}</p>
            <p>{item.effect}</p>
            <p>
              <img
                src={coinIcon}
                alt="coin"
                width="16"
                style={{ verticalAlign: 'middle', marginRight: '4px' }}
              />
              <strong>{item.price} Coins</strong>
            </p>
            <button
              onClick={() => buyItem(item)}
              disabled={purchasedIds.includes(item.id)}
              style={{ marginTop: '8px' }}
            >
              {purchasedIds.includes(item.id) ? '✅ Purchased' : 'Buy'}
            </button>
          </div>
        ))}
      </div>
      <p style={{ textAlign: 'center', marginTop: '10px' }}>{message}</p>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')}>
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Shop;
