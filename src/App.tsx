import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import './App.css';
import { Phase, BreathingSettings, BREATHING_PRESETS, BreathingPattern, CompletedSession } from './types';
import { saveSession, getStreak, getTodaysMinutes, getGoal } from './storage';
import SessionSummary from './components/SessionSummary';
import StatsPanel from './components/StatsPanel';

import forestBg from './assets/backgrounds/forest.jpg';
import oceanBg from './assets/backgrounds/ocean.jpg';
import mountainBg from './assets/backgrounds/mountain.jpg';
import spaceBg from './assets/backgrounds/space.jpg';

const backgroundImages: Record<string, string> = {
  forest: forestBg,
  ocean: oceanBg,
  mountain: mountainBg,
  space: spaceBg,
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  opacity: number;
}

// Atomic state machine for breathing phases
interface BreathState {
  phase: Phase;
  count: number;
}

function getNextPhase(currentPhase: Phase, pattern: BreathingPattern): { phase: Phase; duration: number } {
  const order: Phase[] = ['inhale', 'hold', 'exhale', 'pause'];
  const durations: Record<Phase, number> = {
    inhale: pattern.inhaleTime,
    hold: pattern.holdTime,
    exhale: pattern.exhaleTime,
    pause: pattern.pauseTime,
  };
  let idx = order.indexOf(currentPhase);
  for (let i = 0; i < 4; i++) {
    idx = (idx + 1) % 4;
    if (durations[order[idx]] > 0) {
      return { phase: order[idx], duration: durations[order[idx]] };
    }
  }
  return { phase: 'inhale', duration: pattern.inhaleTime };
}

type BreathAction = { type: 'tick'; pattern: BreathingPattern } | { type: 'reset'; phase: Phase; count: number };

function breathReducer(state: BreathState, action: BreathAction): BreathState {
  switch (action.type) {
    case 'tick': {
      if (state.count <= 1) {
        const next = getNextPhase(state.phase, action.pattern);
        return { phase: next.phase, count: next.duration };
      }
      return { ...state, count: state.count - 1 };
    }
    case 'reset':
      return { phase: action.phase, count: action.count };
    default:
      return state;
  }
}

function getPhaseDuration(phase: Phase, pattern: BreathingPattern): number {
  const map: Record<Phase, number> = {
    inhale: pattern.inhaleTime,
    hold: pattern.holdTime,
    exhale: pattern.exhaleTime,
    pause: pattern.pauseTime,
  };
  return map[phase];
}

function App() {
  const [breathState, dispatch] = useReducer(breathReducer, { phase: 'inhale' as Phase, count: 4 });
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [settings, setSettings] = useState<BreathingSettings>({
    pattern: BREATHING_PRESETS[0],
    background: 'default',
    sessionDuration: 5,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);
  const sessionElapsedRef = useRef(0);
  const patternRef = useRef(settings.pattern);

  const { pattern } = settings;
  const { phase, count } = breathState;

  // Keep pattern ref in sync for the timer
  useEffect(() => { patternRef.current = pattern; }, [pattern]);

  // Enhanced particle animation effect
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    const particleCount = 25;
    const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 1.5 + 0.5,
      angle: Math.random() * Math.PI * 2,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setParticles(newParticles);

    const animation = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: (p.x + Math.cos(p.angle) * p.speed + window.innerWidth) % window.innerWidth,
          y: (p.y + Math.sin(p.angle) * p.speed + window.innerHeight) % window.innerHeight,
          opacity: p.opacity + Math.sin(Date.now() / 1000) * 0.1,
          angle: p.angle + Math.sin(Date.now() / 2000) * 0.02,
        })),
      );
    }, 50);
    return () => clearInterval(animation);
  }, [isActive]);

  // Stable breathing timer — only depends on isActive, uses ref for pattern
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      dispatch({ type: 'tick', pattern: patternRef.current });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Stopwatch effect
  useEffect(() => {
    if (!isActive) {
      setSessionStartTime(null);
      return;
    }
    if (!sessionStartTime) {
      setSessionStartTime(Date.now());
      setElapsedTime(0);
    }
    const interval = setInterval(() => {
      if (sessionStartTime) {
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        setElapsedTime(elapsed);
        sessionElapsedRef.current = elapsed;
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isActive, sessionStartTime]);

  // Session duration auto-stop
  const finishSession = useCallback((elapsed: number) => {
    const session: CompletedSession = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      date: new Date().toISOString(),
      durationSeconds: elapsed,
      patternName: pattern.name,
      completedFull: elapsed >= settings.sessionDuration * 60,
    };
    saveSession(session);
    setIsActive(false);
    setSessionStartTime(null);
    setRemainingTime(null);
    setCompletedSession(session);
  }, [pattern.name, settings.sessionDuration]);

  useEffect(() => {
    if (isActive && settings.sessionDuration > 0) {
      const totalSeconds = settings.sessionDuration * 60;
      setRemainingTime(totalSeconds - elapsedTime);
      if (elapsedTime >= totalSeconds) {
        finishSession(elapsedTime);
      }
    }
  }, [isActive, elapsedTime, settings.sessionDuration, finishSession]);

  const toggleBreathing = () => {
    if (isActive) {
      finishSession(sessionElapsedRef.current);
    } else {
      const durations: Record<Phase, number> = {
        inhale: pattern.inhaleTime,
        hold: pattern.holdTime,
        exhale: pattern.exhaleTime,
        pause: pattern.pauseTime,
      };
      const order: Phase[] = ['inhale', 'hold', 'exhale', 'pause'];
      const startPhase = order.find(p => durations[p] > 0) || 'inhale';
      dispatch({ type: 'reset', phase: startPhase, count: durations[startPhase] });
      setSessionStartTime(Date.now());
      setElapsedTime(0);
      sessionElapsedRef.current = 0;
      setRemainingTime(settings.sessionDuration * 60);
      setIsActive(true);
    }
  };

  const handlePatternSelect = (presetName: string) => {
    const preset = BREATHING_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSettings(prev => ({ ...prev, pattern: { ...preset } }));
    }
  };

  const handleTimingChange = (field: 'inhaleTime' | 'holdTime' | 'exhaleTime' | 'pauseTime', value: number) => {
    const min = (field === 'holdTime' || field === 'pauseTime') ? 0 : 1;
    setSettings(prev => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        name: 'Custom',
        [field]: Math.max(min, Math.min(10, value)),
      },
    }));
  };

  const handleSessionDurationChange = (value: number) => {
    setSettings(prev => ({
      ...prev,
      sessionDuration: Math.max(1, Math.min(60, value)),
    }));
  };

  const handleBackgroundChange = (value: BreathingSettings['background']) => {
    setSettings(prev => ({ ...prev, background: value }));
  };

  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(Math.max(0, timeInSeconds) / 60);
    const seconds = Math.max(0, timeInSeconds) % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getParticleOpacity = (baseOpacity: number) => {
    switch (phase) {
      case 'inhale': return baseOpacity * 0.8;
      case 'hold': return baseOpacity;
      case 'exhale': return baseOpacity * 0.6;
      case 'pause': return baseOpacity * 0.4;
      default: return baseOpacity;
    }
  };

  const bgStyle = settings.background !== 'default' && backgroundImages[settings.background]
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)), url(${backgroundImages[settings.background]})` }
    : undefined;

  const streak = getStreak();

  const TRANSITION_COMPLETION_RATIO = 0.85;
  const MIN_TRANSITION_DURATION_SECONDS = 0.5;
  const MAX_TRANSITION_DURATION_SECONDS = 3;

  // Keep the circle animation slightly ahead of the phase timing, while preventing
  // transitions from becoming too abrupt on short phases or too slow on long ones.
  const phaseDuration = getPhaseDuration(phase, pattern);
  const transitionDuration = Math.max(
    MIN_TRANSITION_DURATION_SECONDS,
    Math.min(phaseDuration * TRANSITION_COMPLETION_RATIO, MAX_TRANSITION_DURATION_SECONDS)
  );
  const circleStyle = isActive ? {
    transitionDuration: `${transitionDuration}s`,
  } : undefined;

  return (
    <div className={`App ${settings.background === 'default' ? 'background-default' : 'background-image'}`} style={bgStyle}>
      {isActive && particles.map(particle => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: getParticleOpacity(particle.opacity),
          }}
        />
      ))}

      {streak > 0 && !isActive && (
        <div className="streak-badge">🔥 {streak} day{streak !== 1 ? 's' : ''}</div>
      )}

      <div className={`breathing-circle ${isActive ? 'active' : ''} ${phase}`} style={circleStyle}>
        <div className="count">{count}</div>
        <div className="phase">{phase}</div>
        {remainingTime !== null && (
          <div className="timer">{formatTime(remainingTime)}</div>
        )}
      </div>

      <div className="stopwatch">
        {isActive || elapsedTime > 0 ? formatTime(elapsedTime) : '--:--'}
      </div>

      <button className="start-button" onClick={toggleBreathing}>
        {isActive ? 'Stop Session' : 'Start Session'}
      </button>

      <div className="top-buttons">
        <button className="icon-button" onClick={() => setShowStats(true)} title="Your Progress">
          📊
        </button>
        <button className="icon-button" onClick={() => setShowSettings(!showSettings)} title="Settings">
          ⚙️
        </button>
      </div>

      {showSettings && (
        <div className="settings-panel">
          <div className="setting-item">
            <label>Pattern:</label>
            <select
              value={pattern.name}
              onChange={e => handlePatternSelect(e.target.value)}
              disabled={isActive}
            >
              {BREATHING_PRESETS.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="setting-item">
            <label>Background:</label>
            <select
              value={settings.background}
              onChange={e => handleBackgroundChange(e.target.value as BreathingSettings['background'])}
              disabled={isActive}
            >
              <option value="default">Default</option>
              <option value="forest">Forest</option>
              <option value="ocean">Ocean</option>
              <option value="mountain">Mountain</option>
              <option value="space">Space</option>
            </select>
          </div>
          <div className="setting-item">
            <label>Inhale (s):</label>
            <input type="number" min="1" max="10" value={pattern.inhaleTime}
              onChange={e => handleTimingChange('inhaleTime', parseInt(e.target.value))} disabled={isActive} />
          </div>
          <div className="setting-item">
            <label>Hold (s):</label>
            <input type="number" min="0" max="10" value={pattern.holdTime}
              onChange={e => handleTimingChange('holdTime', parseInt(e.target.value))} disabled={isActive} />
          </div>
          <div className="setting-item">
            <label>Exhale (s):</label>
            <input type="number" min="1" max="10" value={pattern.exhaleTime}
              onChange={e => handleTimingChange('exhaleTime', parseInt(e.target.value))} disabled={isActive} />
          </div>
          <div className="setting-item">
            <label>Pause (s):</label>
            <input type="number" min="0" max="10" value={pattern.pauseTime}
              onChange={e => handleTimingChange('pauseTime', parseInt(e.target.value))} disabled={isActive} />
          </div>
          <div className="setting-item">
            <label>Session (min):</label>
            <input type="number" min="1" max="60" value={settings.sessionDuration}
              onChange={e => handleSessionDurationChange(parseInt(e.target.value))} disabled={isActive} />
          </div>
        </div>
      )}

      {completedSession && (
        <SessionSummary
          session={completedSession}
          streak={getStreak()}
          todaysMinutes={getTodaysMinutes()}
          dailyGoal={getGoal().dailyMinutes}
          onClose={() => {
            setCompletedSession(null);
            setElapsedTime(0);
          }}
        />
      )}

      {showStats && <StatsPanel onClose={() => setShowStats(false)} />}
    </div>
  );
}

export default App;
