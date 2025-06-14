import React from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './SpellbookModal.module.css';

/** 
 * Props:
 *  - user: the user object (needs .uid and .pendingSpellbookLevels)
 *  - onClose: callback to hide the modal
 */
export default function SpellbookModal({ user, onClose }) {
  // Spellbook options for dashboard (you can customize this list)
  const SPELLBOOK_OPTIONS = [
    {
      id: 'fireball',
      name: 'Fireball',
      image: '/images/spellbooks/fireball.png',
      description: 'A blazing tome that scorches foes.',
      effect: 'Instantly deal 10 fire damage',
    },
    {
      id: 'iceshard',
      name: 'Ice Shard',
      image: '/images/spellbooks/iceshard.png',
      description: 'A chilling scroll of frost.',
      effect: 'Deal 8 damage and slow the enemy',
    },
    {
      id: 'heal',
      name: 'Heal',
      image: '/images/spellbooks/heal.png',
      description: 'Restorative runes to mend wounds.',
      effect: 'Restore 10 HP',
    },
    // …add more if you like…
  ];

  const chooseSpellbook = async (spell) => {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      // add to inventory with its own type
      inventory: arrayUnion({ ...spell, type: 'spellbook' }),
      // remove this level from pendingSpellbookLevels
      pendingSpellbookLevels: arrayRemove(user.level),
    });
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Choose Your Spellbook</h3>
        <div className={styles.grid}>
          {SPELLBOOK_OPTIONS.map((spell) => (
            <div
              key={spell.id}
              className={styles.card}
              onClick={() => chooseSpellbook(spell)}
            >
              <img src={spell.image} alt={spell.name} />
              <h4>{spell.name}</h4>
              <p>{spell.description}</p>
              <small>{spell.effect}</small>
            </div>
          ))}
        </div>
        <button onClick={onClose} className={styles.close}>
          Cancel
        </button>
      </div>
    </div>
  );
}
