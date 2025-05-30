// src/components/Shop.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const initialShopItems = [
  {
    id: 'sword1',
    name: 'Iron Sword',
    type: 'Weapon',
    rarity: 'Uncommon',
    effect: '+2 Strength',
    statBoost: { strength: 2 },
    price: 30,
    description: 'A sturdy sword for reliable melee attacks.',
    icon: 'https://cdn-icons-png.flaticon.com/512/3144/3144456.png'
  },
  {
    id: 'boots1',
    name: 'Swift Boots',
    type: 'Boots',
    rarity: 'Uncommon',
    effect: '+2 Agility',
    statBoost: { agility: 2 },
    price: 25,
    description: 'Increases movement speed and flexibility.',
    icon: 'https://cdn-icons-png.flaticon.com/512/616/616408.png'
  },
  {
    id: 'armor1',
    name: 'Chainmail Vest',
    type: 'Armor',
    rarity: 'Rare',
    effect: '+3 Endurance',
    statBoost: { endurance: 3 },
    price: 50,
    description: 'Provides solid protection in battle.',
    icon: 'https://cdn-icons-png.flaticon.com/512/3340/3340317.png'
  },
  {
    id: 'potion1',
    name: 'Health Potion',
    type: 'Consumable',
    rarity: 'Common',
    effect: 'Restore 10 HP',
    price: 15,
    description: 'Heals minor wounds instantly.',
    icon: 'https://cdn-icons-png.flaticon.com/512/590/590685.png'
  }
];

function Shop() {
  const [userData, setUserData] = useState(null);
  const [shopItems] = useState(initialShopItems);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return navigate('/login');

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData({ ...snap.data(), id: user.uid });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const buyItem = async (item) => {
    if (!userData) return;
    const userRef = doc(db, 'users', userData.id);

    const alreadyOwned = userData.inventory?.some(i => i.id === item.id);
    if (alreadyOwned) {
      alert('You already own this item.');
      return;
    }

    if (userData.coins < item.price) {
      alert('Not enough coins!');
      return;
    }

    try {
      await updateDoc(userRef, {
        coins: increment(-item.price),
        inventory: arrayUnion(item)
      });
      alert(`You bought ${item.name}!`);
    } catch (err) {
      console.error(err);
      alert('Purchase failed.');
    }
  };

  if (!userData) return <p>Loading shop...</p>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🛒 Shop</h2>
      <p>💰 Coins: {userData.coins}</p>

      {shopItems.map((item) => {
        const owned = userData.inventory?.some(i => i.id === item.id);
        return (
          <div
            key={item.id}
            style={{
              marginBottom: '10px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: owned ? '#f0f0f0' : '#fff',
              opacity: owned ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <img src={item.icon} alt={item.name} width="40" />
            <div style={{ flexGrow: 1 }}>
              <p><strong>{item.name}</strong> ({item.rarity})</p>
              <p>{item.effect} - {item.description}</p>
              <p>Price: {item.price} coins</p>
            </div>
            <button onClick={() => buyItem(item)} disabled={owned}>
              {owned ? '✅ Owned' : 'Buy'}
            </button>
          </div>
        );
      })}

      <br />
      <button onClick={() => navigate('/dashboard')}>
        🔙 Back to Dashboard
      </button>
    </div>
  );
}

export default Shop;
