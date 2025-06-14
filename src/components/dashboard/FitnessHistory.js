import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import UserContext from '../../contexts/UserContext';
import styles from './FitnessHistory.module.css';

const FILTERS = ['All Time', 'Last 7 Days', 'Last Month', 'Last Year'];

export default function FitnessHistory() {
  const { userData } = useContext(UserContext);
  const [filter, setFilter] = useState('All Time');
  const [logs, setLogs]     = useState([]);

  useEffect(() => {
    if (!userData) return;
    async function fetchLogs() {
      const ref = collection(db, 'users', userData.uid, 'dailyLogs');
      let q;
      if (filter === 'All Time') {
        q = query(ref, orderBy('date', 'desc'));
      } else {
        const today = new Date();
        const start = new Date(today);
        if (filter === 'Last 7 Days') start.setDate(today.getDate() - 7);
        if (filter === 'Last Month')  start.setMonth(today.getMonth() - 1);
        if (filter === 'Last Year')   start.setFullYear(today.getFullYear() - 1);
        const startStr = start.toISOString().slice(0,10);
        q = query(ref, where('date', '>=', startStr), orderBy('date', 'desc'));
      }
      const snap = await getDocs(q);
      setLogs(snap.docs.map(d => d.data()));
    }
    fetchLogs();
  }, [userData, filter]);

  return (
    <div className={styles.historyContainer}>
      <h2>📜 Fitness Log History</h2>

      <div className={styles.filterSection}>
        <label>
          Show:
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            {FILTERS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </label>
      </div>

      <table className={styles.logTable}>
        <thead>
          <tr>
            <th>Date</th><th>Steps</th><th>Miles</th>
            <th>Sleep (h)</th><th>Water (oz)</th><th>Calories</th><th>Workouts</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.date}>
              <td>{log.date}</td>
              <td>{log.steps}</td>
              <td>{log.miles}</td>
              <td>{log.sleepHours}</td>
              <td>{log.waterOunces}</td>
              <td>{log.caloriesBurnt}</td>
              <td>
                {log.workouts
                  .filter(w => w.type)
                  .map((w,i) => `${w.type} (${w.duration}m)`)
                  .join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
