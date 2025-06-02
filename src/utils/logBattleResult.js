// File: src/utils/logBattleResult.js

import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export const logBattleResult = async (uid, result) => {
  const today = new Date().toISOString().split('T')[0];
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    battleLog: arrayUnion({ date: today, result }) // result = "win" or "loss"
  });
};
