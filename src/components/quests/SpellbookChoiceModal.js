import React from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './SpellbookChoiceModal.module.css';

/**
 * Props:
 *  - userId: string
 *  - level: number           // the level at which we’re picking
 *  - options: Array<spell>   // the 3 random spellbooks
 *  - onClose: () => void
 */
export default function SpellbookChoiceModal({ userId, level, options, onClose }) {
  const choose = async (spell) => {
    const userRef = doc(db, 'users', userId);

    // 1) add to inventory as type 'spellbook'
    // 2) remove this level from pendingSpellbookLevels
    await updateDoc(userRef, {
      inventory: arrayUnion({ ...spell, type: 'spellbook' }),
      pendingSpellbookLevels: arrayRemove(level),
    });

    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Choose Your Spellbook</h3>
        <div className={styles.grid}>
          {options.map((spell) => (
            <div
              key={spell.id}
              className={styles.card}
              onClick={() => choose(spell)}
            >
              <img src={spell.image} alt={spell.name} />
              <h4>{spell.name}</h4>
              <p>{spell.description}</p>
              <small>{spell.effect}</small>
            </div>
          ))}
        </div>
        <button className={styles.close} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
