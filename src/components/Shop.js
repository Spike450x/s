import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  doc,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import itemIcons from '../utils/itemIcons';
import { rarityColors } from '../utils/colors';

const SHOP_ITEMS = [
  {
    id: 'sword_of_flame',
    name: 'Sword of Flame',
    type: 'Weapon',
    rarity: 'epic',
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
    rarity: 'rare',
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
    rarity: 'common',
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
  const navigate = useNavigate();

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

    setPurchasedIds(prev => [...prev, item.id]);
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
      setPurchasedIds(prev => prev.filter(id => id !== item.id));
      setMessage('⚠️ Purchase failed.');
    }
  };

  if (!userData) return <p>Loading shop...</p>;

  return (
    <div style={{ textAlign: 'center' }}>
      <h2>🛒 Shop</h2>
      <p>💰 Coins: {userData.coins || 0}</p>
      {SHOP_ITEMS.map(item => (
        <div key={item.id} style={{
          margin: '10px auto',
          maxWidth: '300px',
          padding: '10px',
          border: '2px solid #ccc',
          borderRadius: '8px',
          backgroundColor: purchasedIds.includes(item.id) ? '#e0e0e0' : rarityColors[item.rarity] || '#fff'
        }}>
          <img src={item.icon} alt={item.name} width="40" />
          <h4>{item.name}</h4>
          <p><em>{item.description}</em></p>
          <p>{item.effect}</p>
          <p><strong>💰 {item.price}</strong> | {item.rarity}</p>
          <button
            onClick={() => buyItem(item)}
            disabled={purchasedIds.includes(item.id)}
          >
            {purchasedIds.includes(item.id) ? '✅ Purchased' : 'Buy'}
          </button>
        </div>
      ))}
      <p>{message}</p>
      <br />
      <button onClick={() => navigate('/dashboard')}>
        🔙 Back to Dashboard
      </button>
    </div>
  );
}

export default Shop;
