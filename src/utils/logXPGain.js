// utils/logXPGain.js
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export const logXPGain = async (uid, amount) => {
  const today = new Date().toISOString().split('T')[0];
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    xpLog: arrayUnion({ date: today, xp: amount })
  });
};
