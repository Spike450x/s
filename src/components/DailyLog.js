// src/components/DailyLog.js

import React, { useState, useEffect, useContext } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { logDailyStats } from '../utils/logDailyStats';
import UserContext from '../contexts/UserContext';

import styles from './DailyLog.module.css';

export default function DailyLog() {
  const { userData } = useContext(UserContext);
  const today = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/New_York'
  });

  // Wizard state
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form fields
  const [steps, setSteps]                 = useState('');
  const [miles, setMiles]                 = useState('');
  const [sleepHours, setSleepHours]       = useState('');
  const [waterOunces, setWaterOunces]     = useState('');
  const [caloriesBurnt, setCaloriesBurnt] = useState('');
  const [workouts, setWorkouts]           = useState([{ type: '', duration: '' }]);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [message, setMessage]               = useState('');

  // Check for existing log
  useEffect(() => {
    if (!userData) return;
    const ref = doc(db, 'users', userData.uid, 'dailyLogs', today);
    getDoc(ref).then(snap => {
      if (snap.exists()) setHasLoggedToday(true);
    });
  }, [userData, today]);

  const next  = () => setStep(s => Math.min(s + 1, totalSteps));
  const back  = () => setStep(s => Math.max(s - 1, 1));
  const submit = async () => {
    if (!userData) return setMessage('Please log in first.');
    const filteredWorkouts = workouts
      .filter(w => w.type && w.duration)
      .map(w => ({ type: w.type, duration: Number(w.duration) }));

    const stats = {
      date: today,
      steps: Number(steps),
      miles: Number(miles),
      sleepHours: Number(sleepHours),
      waterOunces: Number(waterOunces),
      caloriesBurnt: Number(caloriesBurnt),
      workouts: filteredWorkouts
    };

    try {
      await logDailyStats(userData.uid, stats);
      setHasLoggedToday(true);
      setMessage('✅ Daily stats saved! See you tomorrow.');
    } catch (err) {
      console.error(err);
      setMessage(`⚠️ ${err.message}`);
    }
  };

  if (hasLoggedToday) {
    return (
      <div className={styles.dlConfirmation}>
        <h3>✅ You’ve already logged for {today}</h3>
        <p>Come back after midnight (NY) to log again.</p>
      </div>
    );
  }

  return (
    <div className={styles.dlWizard}>
      <h3>Step {step} of {totalSteps}</h3>
      {message && <p className={styles.dlMessage}>{message}</p>}

      {step === 1 && (
        <div className={styles.dlStep}>
          <label>
            Steps walked
            <input
              type="number"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder="e.g. 8000"
              className={styles.dlInput}
            />
          </label>
          <label>
            Miles run
            <input
              type="number"
              value={miles}
              onChange={e => setMiles(e.target.value)}
              placeholder="e.g. 3.2"
              step="0.1"
              className={styles.dlInput}
            />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className={styles.dlStep}>
          <label>
            Sleep (hours)
            <input
              type="number"
              value={sleepHours}
              onChange={e => setSleepHours(e.target.value)}
              placeholder="e.g. 7.5"
              step="0.1"
              className={styles.dlInput}
            />
          </label>
          <label>
            Water (oz)
            <input
              type="number"
              value={waterOunces}
              onChange={e => setWaterOunces(e.target.value)}
              placeholder="e.g. 64"
              className={styles.dlInput}
            />
          </label>
          <label>
            Calories burnt
            <input
              type="number"
              value={caloriesBurnt}
              onChange={e => setCaloriesBurnt(e.target.value)}
              placeholder="e.g. 500"
              className={styles.dlInput}
            />
          </label>
        </div>
      )}

      {step === 3 && (
        <fieldset className={styles.dlWorkouts}>
          <legend>Workouts</legend>
          {workouts.map((w,i) => (
            <div key={i} className={styles.dlWorkoutRow}>
              <select
                value={w.type}
                onChange={e => {
                  const arr = [...workouts];
                  arr[i].type = e.target.value;
                  setWorkouts(arr);
                }}
                className={styles.dlInput}
              >
                <option value="">Select type…</option>
                <option value="strength">Strength</option>
                <option value="run">Run</option>
                <option value="HIIT">HIIT</option>
              </select>
              <input
                type="number"
                value={w.duration}
                onChange={e => {
                  const arr = [...workouts];
                  arr[i].duration = e.target.value;
                  setWorkouts(arr);
                }}
                placeholder="Duration (min)"
                className={styles.dlInput}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setWorkouts([...workouts, { type: '', duration: '' }])}
            className={styles.dlAddBtn}
          >
            + Add Workout
          </button>
        </fieldset>
      )}

      {step === 4 && (
        <div className={styles.dlStep}>
          <h4>Review Your Entries</h4>
          <ul className={styles.dlReview}>
            <li>Steps: {steps || '—'}</li>
            <li>Miles: {miles || '—'}</li>
            <li>Sleep: {sleepHours || '—'} hrs</li>
            <li>Water: {waterOunces || '—'} oz</li>
            <li>Calories: {caloriesBurnt || '—'}</li>
            <li>Workouts:
              <ul>
                {workouts.map((w,i) =>
                  w.type ? (
                    <li key={i}>{w.type} — {w.duration} min</li>
                  ) : null
                )}
              </ul>
            </li>
          </ul>
        </div>
      )}

      <div className={styles.dlButtons}>
        {step > 1 && <button onClick={back}>← Back</button>}
        {step < totalSteps && <button onClick={next}>Next →</button>}
        {step === totalSteps && (
          <button onClick={submit} className={styles.dlSubmit}>
            Save Log
          </button>
        )}
      </div>
    </div>
  );
}
