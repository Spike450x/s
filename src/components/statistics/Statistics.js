import React, { useContext } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title as ChartTitle,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from 'chart.js';
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ChartTitle,
  ChartTooltip,
  ChartLegend
);

export default function Statistics() {
  const navigate = useNavigate();
  const { userData, loading } = useContext(UserContext);

  if (loading || !userData) {
    return <div className="text-center p-4">Loading statistics…</div>;
  }

  const xpHistory = userData.xpHistory || [];
  const battleHistory = userData.battleHistory || [];
  const questHistory = userData.questHistory || [];

  const lastActivityDate = userData.lastActivity
    ? new Date(userData.lastActivity).toLocaleDateString()
    : 'N/A';

  const xpLabels = xpHistory.map((entry) =>
    new Date(entry.date).toLocaleDateString()
  );
  const xpDataSet = xpHistory.map((entry) => entry.xp);

  const wins = battleHistory.filter((b) => b.result === 'win').length;
  const losses = battleHistory.filter((b) => b.result === 'loss').length;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>

      <div className="mb-6">
        <p>
          Last Activity:{' '}
          <span className="font-medium">{lastActivityDate}</span>
        </p>
        <p>
          Total Playtime:{' '}
          <span className="font-medium">{userData.playtime} hours</span>
        </p>
        <p>
          Monsters Defeated:{' '}
          <span className="font-medium">
            {userData.monstersDefeated || 0}
          </span>
        </p>
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">XP Gained Over Time</h3>
        <Line
          data={{
            labels: xpLabels,
            datasets: [
              {
                label: 'XP Gained',
                data: xpDataSet,
                fill: false,
                borderColor: '#3b82f6',
                tension: 0.1,
              },
            ],
          }}
          options={{
            scales: {
              x: { title: { display: true, text: 'Date' } },
              y: { title: { display: true, text: 'XP' } },
            },
            plugins: {
              legend: { display: false },
            },
          }}
        />
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Battle Outcomes</h3>
        <Bar
          data={{
            labels: ['Wins', 'Losses'],
            datasets: [
              {
                label: 'Count',
                data: [wins, losses],
                backgroundColor: ['#10b981', '#ef4444'],
              },
            ],
          }}
          options={{
            scales: {
              y: { beginAtZero: true },
            },
            plugins: {
              legend: { display: false },
            },
          }}
        />
      </div>

      <div className="mb-8">
        <h3 className="font-semibold mb-2">Quests Completed</h3>
        <ul className="list-disc ml-6">
          {questHistory.map((entry) => {
            const key = `${entry.name}-${entry.date}`;
            return (
              <li key={key}>
                {entry.name} —{' '}
                <span className="text-gray-600">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="text-center mt-6">
        <button
          className="px-4 py-2 bg-gray-800 text-white rounded"
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
