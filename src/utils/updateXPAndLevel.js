// src/utils/updateXPAndLevel.js

import { runTransaction, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

/** Quadratic XP curve */
export function getXPForNextLevel(level) {
  return Math.floor(50 * Math.pow(level, 2));
}

/**
 * Atomically:
 *  - Adds gainedXP to xp (caps at level 10)
 *  - Awards 1 attribute point per level gained
 *  - Flags every level in pendingSpellbookLevels
 *  - Resets current HP to new max
 */
export async function updateXPAndLevel(userId, gainedXP) {
  const userRef = doc(db, 'users', userId);

  return await runTransaction(db, async (tx) => {
    const snap = await tx.get(userRef);
    if (!snap.exists()) throw new Error('User not found');
    const data = snap.data();

    let xp = (data.xp || 0) + gainedXP;
    let level = data.level || 1;
    let leveledUp = false;
    let attributePointsToAdd = 0;
    const newSpellbookLevels = [];

    if (gainedXP > 0) {
      while (xp >= getXPForNextLevel(level) && level < 10) {
        xp -= getXPForNextLevel(level);
        level += 1;
        leveledUp = true;
        attributePointsToAdd += 1;
        // flag *every* level for a spellbook pick
        newSpellbookLevels.push(level);
      }
    }

    // New max HP = 100 + level*10
    const newMaxHP = 100 + level * 10;

    const updates = {
      xp,
      level,
      attributePoints: (data.attributePoints || 0) + attributePointsToAdd,
      'health.current': newMaxHP,
    };
    if (newSpellbookLevels.length) {
      updates.pendingSpellbookLevels = arrayUnion(...newSpellbookLevels);
    }

    tx.update(userRef, updates);
    return { xp, level, leveledUp, attributePointsToAdd, newSpellbookLevels };
  });
}
