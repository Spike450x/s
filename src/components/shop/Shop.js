// src/components/shop/Shop.js

import React, { useEffect, useState, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../../firebase';   // updated path
import { useNavigate } from 'react-router-dom';
import UserContext from '../../contexts/UserContext';
import itemIcons from '../../utils/itemIcons';
import { rarityColors } from '../../utils/colors';

import styles from './Shop.module.css';
// Corrected path to global index.css
import '../../index.css';

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

    setPurchasedIds((prev) => [...prev, item.id]);
    setMessage(`✅ Bought ${item.name}`);

    const userRef = doc(db, 'users', userData.uid);

    try {
      await updateDoc(userRef, {
        coins: increment(-item.price),
        inventory: arrayUnion(item),
      });
    } catch (err) {
      console.error('❌ Failed to buy:', err);
      setPurchasedIds((prev) => prev.filter((id) => id !== item.id));
      setMessage('⚠️ Purchase failed.');
    }
  };

  if (!userData) return <p>Loading shop...</p>;

  return (
    <div className={styles.container}>
      <h2 className="text-2xl font-semibold mb-4 text-center">🛒 Shop</h2>
      <p className="text-center mb-6">💰 Coins: {userData.coins || 0}</p>
      <div className={styles.itemGrid}>
        {SHOP_ITEMS.map((item) => (
          <div
            key={item.id}
            className={styles.itemCard}
            style={{
              border: `3px solid ${
                rarityColors[item.rarity.toLowerCase()] || '#ccc'
              }`,
            }}
          >
            <img src={item.icon} alt={item.name} width="40" />
            <h3 className="mt-2 mb-1 text-lg font-medium">{item.name}</h3>
            <p
              className="font-semibold mb-1"
              style={{
                color: rarityColors[item.rarity.toLowerCase()],
              }}
            >
              {item.rarity.toUpperCase()}
            </p>
            <p className="mb-1">{item.description}</p>
            <p className="mb-2">{item.effect}</p>
            <p className="mb-4">
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
              className={styles.buyButton}
            >
              {purchasedIds.includes(item.id) ? '✅ Purchased' : 'Buy'}
            </button>
          </div>
        ))}
      </div>

      {message && <p className="text-center mt-4">{message}</p>}

      <div className={styles.footer}>
        <button
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Shop;
