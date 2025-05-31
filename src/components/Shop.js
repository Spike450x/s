import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  runTransaction
} from 'firebase/firestore';
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
    icon: itemIcons.sword
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
    icon: itemIcons.boots
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
    icon: itemIcons.potion
  }
];

function Shop() {
  const [userData, setUserData] = useState(null);
  const [purchasedIds, setPurchasedIds] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserData({ ...data, id: user.uid });
        const inventory = data.inventory || [];
        setPurchasedIds(inventory.map(item => item.id));
      }
    };
    fetchData();
  }, []);

  const buyItem = async (item) => {
    if (!userData || purchasedIds.includes(item.id)) return;
    if ((userData.coins || 0) < item.price) {
      setMessage('❌ Not enough coins!');
      return;
    }

    setPurchasedIds(prev => [...prev, item.id]); // local UI update
    setMessage(`✅ Bought ${item.name}`);

    try {
      const userRef = doc(db, 'users', userData.id);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists()) throw new Error('User not found');
        const data = snap.data();

        const newCoins = (data.coins || 0) - item.price;
        const inventory = data.inventory || [];
        const alreadyBought = inventory.some(i => i.id === item.id);
        if (alreadyBought) return;

        tx.update(userRef, {
          coins: newCoins,
          inventory: [...inventory, item]
        });
      });
    } catch (err) {
      console.error('❌ Failed to buy:', err);
      setPurchasedIds(prev => prev.filter(id => id !== item.id)); // rollback
      setMessage('⚠️ Purchase failed.');
    }
  };

  if (!userData) return <p>Loading shop...</p>;

  return (
    <div>
      <h2 style={{ textAlign: 'center' }}>🛒 Shop</h2>
      <p style={{ textAlign: 'center' }}>💰 Coins: {userData.coins || 0}</p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
        {SHOP_ITEMS.map(item => (
          <div
            key={item.id}
            style={{
              width: '220px',
              padding: '12px',
              border: `3px solid ${rarityColors[item.rarity.toLowerCase()] || '#ccc'}`,
              borderRadius: '10px',
              backgroundColor: '#fff',
              textAlign: 'center'
            }}
          >
            <img src={item.icon} alt={item.name} width="40" />
            <h3 style={{ margin: '10px 0 5px' }}>{item.name}</h3>
            <p style={{ margin: '0', fontWeight: 'bold', color: rarityColors[item.rarity.toLowerCase()] }}>
              {item.rarity.toUpperCase()}
            </p>
            <p style={{ marginTop: '8px' }}>{item.description}</p>
            <p>{item.effect}</p>
            <p>
              <img src={coinIcon} alt="coin" width="16" style={{ verticalAlign: 'middle', marginRight: '4px' }} />
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
        <button onClick={() => window.location.href = '/dashboard'}>
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Shop;
