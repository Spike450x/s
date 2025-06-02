import React, { useEffect, useState, useContext } from 'react';
import { doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import itemIcons from '../utils/itemIcons';
import { rarityColors } from '../utils/colors';

// URL to a coin emoji icon, used in price displays
const coinIcon = 'https://img.icons8.com/emoji/48/coin-emoji.png';

/**
 * SHOP_ITEMS
 *
 * A hardcoded array of items available in the shop. Each item includes:
 * - id: unique identifier (string)
 * - name: display name
 * - type: slot type ("Weapon", "Boots", "Consumable", etc.)
 * - rarity: string indicating rarity ("Common", "Rare", "Epic", etc.)
 * - effect: string describing the item’s effect
 * - stat: which stat it affects (for reference)
 * - bonus: numeric bonus amount (for reference)
 * - price: cost in coins (number)
 * - description: tooltip text
 * - icon: URL to an icon image
 */
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

/**
 * Shop component
 *
 * Displays shop inventory, shows the user’s current coin balance, and lets them purchase items.
 * Purchased items are added to the user’s Firestore inventory and deducted from their coins.
 *
 * Context:
 * - Uses UserContext to retrieve userData (includes uid, coins, inventory, etc.).
 *
 * State:
 * - purchasedIds: array of item IDs that the user already owns (to disable Buy button)
 * - message: string for feedback messages (e.g., purchase success/failure)
 */
function Shop() {
  const navigate = useNavigate();
  const { userData } = useContext(UserContext); // Grab real-time user data from context
  const [purchasedIds, setPurchasedIds] = useState([]); // Track IDs of items already purchased
  const [message, setMessage] = useState('');           // Feedback message below shop

  /**
   * Initialize purchasedIds whenever userData changes
   * so that items already in the user’s inventory appear as "Purchased".
   */
  useEffect(() => {
    if (!userData) return;
    const inventory = userData.inventory || [];
    // Map inventory items to their IDs for quick lookup
    setPurchasedIds(inventory.map((item) => item.id));
  }, [userData]);

  /**
   * buyItem
   *
   * Handles purchasing logic for a given item:
   * - If user lacks enough coins, show error message.
   * - Otherwise, optimistically add item.id to purchasedIds and show success message.
   * - Update Firestore: decrement coins by item.price, add item object to inventory array.
   * - If Firestore update fails, roll back purchasedIds and show failure message.
   *
   * @param {object} item - the item object being purchased
   */
  const buyItem = async (item) => {
    if (!userData || purchasedIds.includes(item.id)) return;

    // Check coin balance
    if ((userData.coins || 0) < item.price) {
      setMessage('❌ Not enough coins!');
      return;
    }

    // Optimistic UI update: mark as purchased immediately
    setPurchasedIds((prev) => [...prev, item.id]);
    setMessage(`✅ Bought ${item.name}`);

    const userRef = doc(db, 'users', userData.uid);

    try {
      // Firestore transaction: decrement coins and add item to inventory
      await updateDoc(userRef, {
        coins: increment(-item.price),
        inventory: arrayUnion(item),
      });
      // Rely on UserContext subscription to refresh userData.coins & userData.inventory
    } catch (err) {
      console.error('❌ Failed to buy:', err);
      // Roll back optimistic update if Firestore write fails
      setPurchasedIds((prev) => prev.filter((id) => id !== item.id));
      setMessage('⚠️ Purchase failed.');
    }
  };

  // Show loading message until userData is available
  if (!userData) return <p>Loading shop...</p>;

  return (
    <div>
      {/* Title */}
      <h2 style={{ textAlign: 'center' }}>🛒 Shop</h2>
      {/* Display user’s current coin balance */}
      <p style={{ textAlign: 'center' }}>💰 Coins: {userData.coins || 0}</p>

      {/* Shop item cards container */}
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
            {/* Item Icon */}
            <img src={item.icon} alt={item.name} width="40" />
            {/* Item Name */}
            <h3 style={{ margin: '10px 0 5px' }}>{item.name}</h3>
            {/* Rarity, styled by color */}
            <p
              style={{
                margin: '0',
                fontWeight: 'bold',
                color: rarityColors[item.rarity.toLowerCase()],
              }}
            >
              {item.rarity.toUpperCase()}
            </p>
            {/* Description & Effect */}
            <p style={{ marginTop: '8px' }}>{item.description}</p>
            <p>{item.effect}</p>
            {/* Price, with coin icon */}
            <p>
              <img
                src={coinIcon}
                alt="coin"
                width="16"
                style={{ verticalAlign: 'middle', marginRight: '4px' }}
              />
              <strong>{item.price} Coins</strong>
            </p>
            {/* Buy / Purchased Button */}
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

      {/* Feedback message below the items */}
      <p style={{ textAlign: 'center', marginTop: '10px' }}>{message}</p>

      {/* Back to Dashboard Button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')}>
          🔙 Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Shop;
