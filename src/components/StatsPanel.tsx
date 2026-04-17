import React from 'react';
import { getStreak, getTotalSessions, getTotalMinutes, getTodaysMinutes, getGoal, saveGoal, getSessions } from '../storage';
import './StatsPanel.css';

interface StatsPanelProps {
  onClose: () => void;
}

function formatMinutes(min: number): string {
  if (min < 1) return `${Math.round(min * 60)}s`;
  if (min < 60) return `${Math.round(min)}m`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}h ${m}m`;
}

export default function StatsPanel({ onClose }: StatsPanelProps) {
  const [goal, setGoal] = React.useState(getGoal());
  const streak = getStreak();
  const totalSessions = getTotalSessions();
  const totalMinutes = getTotalMinutes();
  const todaysMinutes = getTodaysMinutes();
  const goalProgress = Math.min(100, (todaysMinutes / goal.dailyMinutes) * 100);

  const recentSessions = getSessions()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  const handleGoalChange = (value: number) => {
    const newGoal = { dailyMinutes: Math.max(1, Math.min(120, value)) };
    setGoal(newGoal);
    saveGoal(newGoal);
  };

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-panel" onClick={e => e.stopPropagation()}>
        <button className="stats-close-btn" onClick={onClose}>✕</button>
        <h2>Your Progress</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card-icon">🔥</span>
            <span className="stat-card-value">{streak}</span>
            <span className="stat-card-label">Day Streak</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">🧘</span>
            <span className="stat-card-value">{totalSessions}</span>
            <span className="stat-card-label">Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-card-icon">⏱️</span>
            <span className="stat-card-value">{formatMinutes(totalMinutes)}</span>
            <span className="stat-card-label">Total Time</span>
          </div>
        </div>

        <div className="stats-goal-section">
          <div className="stats-goal-header">
            <span>Daily Goal</span>
            <div className="stats-goal-input">
              <input
                type="number"
                min="1"
                max="120"
                value={goal.dailyMinutes}
                onChange={(e) => handleGoalChange(parseInt(e.target.value) || 1)}
              />
              <span>min</span>
            </div>
          </div>
          <div className="stats-goal-bar-bg">
            <div className="stats-goal-bar-fill" style={{ width: `${goalProgress}%` }} />
          </div>
          <div className="stats-goal-text">
            {todaysMinutes.toFixed(1)} / {goal.dailyMinutes} min today
            {todaysMinutes >= goal.dailyMinutes && <span> ✅</span>}
          </div>
        </div>

        {recentSessions.length > 0 && (
          <div className="stats-history">
            <h3>Recent Sessions</h3>
            {recentSessions.map(s => (
              <div key={s.id} className="history-item">
                <span className="history-date">
                  {new Date(s.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="history-pattern">{s.patternName}</span>
                <span className="history-duration">{formatMinutes(s.durationSeconds / 60)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
