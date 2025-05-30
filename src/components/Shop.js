// src/components/Shop.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Shop() {
  const [items, setItems] = useState([
    {
      name: 'Iron Sword',
      type: 'Weapon',
      rarity: 'Uncommon',
      effect: '+2 Strength',
      cost: 30,
      description: 'Heavier blade that boosts strength.',
      icon: 'https://cdn-icons-png.flaticon.com/512/7434/7434791.png'
    },
    {
      name: 'Wizard Hat',
      type: 'Armor',
      rarity: 'Rare',
      effect: '+3 Intellect',
      cost: 50,
      description: 'Hat infused with arcane wisdom.',
      icon: 'https://cdn-icons-png.flaticon.com/512/4341/4341025.png'
    },
    {
      name: 'Swift Boots',
      type: 'Boots',
      rarity: 'Uncommon',
      effect: '+2 Agility',
      cost: 25,
      description: 'Light boots perfect for running.',
      icon: 'https://cdn-icons-png.flaticon.com/512/3536/3536860.png'
    },
    {
      name: 'Health Potion',
      type: 'Consumable',
      rarity: 'Common',
      effect: '+10 HP',
      cost: 15,
      description: 'Restores a small amount of health.',
      icon: 'https://cdn-icons-png.flaticon.com/512/590/590685.png'
    }
  ]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return navigate('/login');

    const userRef = doc(db, 'users', user.uid);

    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        setUserData({ ...snap.data(), id: user.uid });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleBuy = async (item) => {
    const user = auth.currentUser;
    if (!user || !userData) return;

    if (userData.coins < item.cost) {
      alert('Not enough coins!');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const currentInventory = userData.inventory || [];
    const alreadyOwned = currentInventory.some(inv => inv.name === item.name);

    if (alreadyOwned) {
      alert('You already own this item.');
      return;
    }

    try {
      await updateDoc(userRef, {
        coins: userData.coins - item.cost,
        inventory: arrayUnion(item)
      });

      alert(`✅ You bought ${item.name}!`);
    } catch (err) {
      console.error(err);
      alert('❌ Purchase failed.');
    }
  };

  if (loading || !userData) return <p>Loading shop...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🛒 Item Shop</h2>
      <p>Coins: {userData.coins}</p>
      {items.map((item, idx) => {
        const owned = (userData.inventory || []).some(i => i.name === item.name);

        return (
          <div
            key={idx}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginBottom: '10px',
              padding: '10px',
              backgroundColor: owned ? '#f4f4f4' : '#fff'
            }}
          >
            <img src={item.icon} alt={item.name} style={{ width: '50px', marginRight: '10px' }} />
            <strong>{item.name}</strong> ({item.rarity}) - {item.effect}<br />
            <em>{item.description}</em><br />
            <p>Cost: {item.cost} coins</p>
            <button
              onClick={() => handleBuy(item)}
              disabled={userData.coins < item.cost || owned}
            >
              {owned ? '✅ Owned' : 'Buy'}
            </button>
          </div>
        );
      })}
      <br />
      <button onClick={() => navigate('/dashboard')}>🔙 Back to Dashboard</button>
    </div>
  );
}

export default Shop;
