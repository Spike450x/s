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
import UserContext from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

// Register necessary Chart.js components for rendering Line and Bar charts
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

/**
 * Statistics page component
 *
 * Displays:
 * - A summary of last activity date, total playtime, and monsters defeated.
 * - A Line chart showing XP gained over time.
 * - A Bar chart showing battle outcomes (wins vs. losses).
 * - A list of completed quests with their completion dates.
 *
 * Uses:
 * - UserContext to retrieve `userData` (which includes xpHistory, battleHistory, questHistory, etc.) and `loading` state.
 * - useNavigate to return to the dashboard.
 */
export default function Statistics() {
  const navigate = useNavigate();
  const { userData, loading } = useContext(UserContext);

  // Show loading message until userData is available
  if (loading || !userData) {
    return <div className="text-center p-4">Loading statistics…</div>;
  }

  // Extract arrays for charts and lists
  const xpHistory = userData.xpHistory || [];           // Array of { source, xp, date }
  const battleHistory = userData.battleHistory || [];   // Array of { monster, result, date }
  const questHistory = userData.questHistory || [];     // Array of { name, date }

  // Format lastActivity (ISO string) to a human-readable date; fallback to 'N/A'
  const lastActivityDate = userData.lastActivity
    ? new Date(userData.lastActivity).toLocaleDateString()
    : 'N/A';

  // Prepare data for XP Over Time Line chart
  const xpLabels = xpHistory.map((entry) =>
    new Date(entry.date).toLocaleDateString()
  );
  const xpDataSet = xpHistory.map((entry) => entry.xp);

  // Count battle outcomes for the Bar chart
  const wins = battleHistory.filter((b) => b.result === 'win').length;
  const losses = battleHistory.filter((b) => b.result === 'loss').length;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Page title */}
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>

      {/* Summary Section: Last Activity, Playtime, Monsters Defeated */}
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

      {/* XP Over Time Line Chart */}
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
              legend: { display: false }, // Hide legend since only one dataset
            },
          }}
        />
      </div>

      {/* Battle Outcomes Bar Chart */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Battle Outcomes</h3>
        <Bar
          data={{
            labels: ['Wins', 'Losses'],
            datasets: [
              {
                label: 'Count',
                data: [wins, losses],
                backgroundColor: ['#10b981', '#ef4444'], // Green for wins, red for losses
              },
            ],
          }}
          options={{
            scales: {
              y: { beginAtZero: true }, // Always start y-axis at zero
            },
            plugins: {
              legend: { display: false },
            },
          }}
        />
      </div>

      {/* Completed Quests List */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Quests Completed</h3>
        <ul className="list-disc ml-6">
          {questHistory.map((entry) => {
            // Use a combination of quest name and date as a unique key
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

      {/* Back to Dashboard Button */}
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
