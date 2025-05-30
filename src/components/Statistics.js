// src/pages/Statistics.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

function Statistics() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      if (!user) return navigate('/login');

      const snap = await getDoc(doc(db, 'users', user.uid));
      if (!snap.exists()) return;

      const data = snap.data();
      const xpHistory = (data.xpHistory || []).sort((a, b) => new Date(a.date) - new Date(b.date));
      const battleHistory = data.battleHistory || [];

      const wins = battleHistory.filter(b => b.result === 'win').length;
      const losses = battleHistory.filter(b => b.result === 'loss').length;

      setStats({
        lastActivity: data.lastActivity || 'Unknown',
        playtime: data.playtime || 0,
        questsCompleted: data.questsCompleted || [],
        monstersDefeated: data.monstersDefeated || 0,
        xpHistory,
        battleResults: { wins, losses }
      });
    };

    fetchStats();
  }, [navigate]);

  if (!stats) return <p>Loading stats...</p>;

  const xpChart = {
    labels: stats.xpHistory.map(entry => entry.date),
    datasets: [{
      label: 'XP Gained',
      data: stats.xpHistory.map(entry => entry.xp),
      borderColor: '#42a5f5',
      backgroundColor: '#bbdefb',
      tension: 0.3,
      fill: true
    }]
  };

  const battleChart = {
    labels: ['Wins', 'Losses'],
    datasets: [{
      label: 'Battles',
      data: [stats.battleResults.wins, stats.battleResults.losses],
      backgroundColor: ['#66bb6a', '#ef5350']
    }]
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>📊 Player Statistics</h2>
      <p><strong>Last Activity:</strong> {stats.lastActivity}</p>
      <p><strong>Total Playtime:</strong> {stats.playtime} hrs</p>
      <p><strong>Monsters Defeated:</strong> {stats.monstersDefeated}</p>

      <h3>📈 XP Gained Over Time</h3>
      <Line data={xpChart} />

      <h3>🧟‍♂️ Battle Outcomes</h3>
      <Bar data={battleChart} />

      <h3>📜 Completed Quests</h3>
      {stats.questsCompleted.length > 0 ? (
        <ul>
          {stats.questsCompleted.map((quest, i) => (
            <li key={i}>{quest}</li>
          ))}
        </ul>
      ) : (
        <p>No quests completed yet.</p>
      )}

      <br />
      <button onClick={() => navigate('/dashboard')}>
        🔙 Back to Dashboard
      </button>
    </div>
  );
}

export default Statistics;
