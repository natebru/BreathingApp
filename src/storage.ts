import { CompletedSession, MeditationGoal } from './types';

const SESSIONS_KEY = 'breathe_sessions';
const GOAL_KEY = 'breathe_goal';
const STORAGE_VERSION_KEY = 'breathe_version';
const CURRENT_VERSION = 1;

function safeParseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function checkVersion(): void {
  const version = localStorage.getItem(STORAGE_VERSION_KEY);
  if (version !== String(CURRENT_VERSION)) {
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
  }
}

export function getSessions(): CompletedSession[] {
  checkVersion();
  return safeParseJSON<CompletedSession[]>(localStorage.getItem(SESSIONS_KEY), []);
}

export function saveSession(session: CompletedSession): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getGoal(): MeditationGoal {
  return safeParseJSON<MeditationGoal>(localStorage.getItem(GOAL_KEY), { dailyMinutes: 5 });
}

export function saveGoal(goal: MeditationGoal): void {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

export function getTodaysSessions(): CompletedSession[] {
  const today = new Date().toISOString().split('T')[0];
  return getSessions().filter(s => s.date.startsWith(today));
}

export function getTodaysMinutes(): number {
  return getTodaysSessions().reduce((sum, s) => sum + s.durationSeconds / 60, 0);
}

export function getStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;

  const sessionDates = new Set(
    sessions.map(s => s.date.split('T')[0])
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayDate = new Date(today);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  // Streak must include today or yesterday
  if (!sessionDates.has(todayStr) && !sessionDates.has(yesterdayStr)) {
    return 0;
  }

  let streak = 0;
  const checkDate = new Date(today);

  // If no session today, start counting from yesterday
  if (!sessionDates.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const dateStr = checkDate.toISOString().split('T')[0];
    if (sessionDates.has(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getTotalSessions(): number {
  return getSessions().length;
}

export function getTotalMinutes(): number {
  return getSessions().reduce((sum, s) => sum + s.durationSeconds / 60, 0);
}
