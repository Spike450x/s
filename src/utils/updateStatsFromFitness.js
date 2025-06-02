// File: src/utils/updateStatsFromFitness.js

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import classOptions from '../utils/classOptions';

export const updateStatsFromFitness = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const { fitness, stats, class: userClass } = data;
  if (!fitness || !stats || !userClass) return;

  const updatedStats = { ...stats };

  updatedStats.agility += Math.floor(fitness.miles / 5);
  updatedStats.strength += Math.floor(fitness.strengthSessions / 3);
  updatedStats.vitality += Math.floor(fitness.workouts / 4);
  updatedStats.intellect += Math.floor(fitness.sleepDays / 5);
  updatedStats.endurance += Math.floor(fitness.waterDays / 5);
  updatedStats.luck += Math.floor(fitness.steps / 10000);

  await updateDoc(userRef, { stats: updatedStats });
};
