import React from 'react';
import { CompletedSession } from '../types';
import './SessionSummary.css';

interface SessionSummaryProps {
  session: CompletedSession;
  streak: number;
  todaysMinutes: number;
  dailyGoal: number;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function SessionSummary({ session, streak, todaysMinutes, dailyGoal, onClose }: SessionSummaryProps) {
  const goalProgress = Math.min(100, (todaysMinutes / dailyGoal) * 100);
  const goalMet = todaysMinutes >= dailyGoal;

  return (
    <div className="summary-overlay" onClick={onClose}>
      <div className="summary-panel" onClick={e => e.stopPropagation()}>
        <h2>Session Complete ✨</h2>

        <div className="summary-stats">
          <div className="summary-stat">
            <span className="stat-value">{formatDuration(session.durationSeconds)}</span>
            <span className="stat-label">Duration</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{session.patternName}</span>
            <span className="stat-label">Pattern</span>
          </div>
        </div>

        <div className="summary-streak">
          <span className="streak-fire">🔥</span>
          <span className="streak-count">{streak} day{streak !== 1 ? 's' : ''}</span>
          <span className="stat-label">streak</span>
        </div>

        <div className="summary-goal">
          <div className="goal-label">
            Daily Goal: {todaysMinutes.toFixed(1)} / {dailyGoal} min
            {goalMet && <span className="goal-check"> ✅</span>}
          </div>
          <div className="goal-bar-bg">
            <div className="goal-bar-fill" style={{ width: `${goalProgress}%` }} />
          </div>
        </div>

        <button className="summary-close" onClick={onClose}>Continue</button>
      </div>
    </div>
  );
}
