import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

function getXPForNextLevel(level) {
  return Math.floor(50 * Math.pow(level, 2));
}

export async function updateXPAndLevel(userId, gainedXP) {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  let { xp = 0, level = 1 } = snap.data();
  xp += gainedXP;

  let leveledUp = false;

  while (xp >= getXPForNextLevel(level)) {
    xp -= getXPForNextLevel(level);
    level += 1;
    leveledUp = true;
  }

  await updateDoc(userRef, {
    xp,
    level
  });

  return { xp, level, leveledUp };
}
