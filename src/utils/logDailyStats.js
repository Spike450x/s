// src/utils/logDailyStats.js

import { doc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { updateStatsFromFitness } from './updateStatsFromFitness';

export async function logDailyStats(userId, stats) {
  // 1) compute today’s ID in YYYY-MM-DD (America/New_York)
  const dateId = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/New_York'
  });

  // 2) write under /users/{uid}/dailyLogs/{dateId}
  const logRef = doc(
    collection(db, 'users', userId, 'dailyLogs'),
    dateId
  );
  await setDoc(logRef, {
    ...stats,
    date: dateId
  });

  // 3) generate class resources as before
  await updateStatsFromFitness(userId, {
    workoutType:    stats.workouts[0]?.type    || null,
    duration:       stats.workouts[0]?.duration || 0,
    miles:          stats.miles,
    loggedHydration: stats.waterOunces >= 64,
    loggedSleep:     stats.sleepHours >= 7,
  });
}
