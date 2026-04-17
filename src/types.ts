export interface BreathingPattern {
  name: string;
  inhaleTime: number;
  holdTime: number;
  exhaleTime: number;
  pauseTime: number;
}

export interface BreathingSettings {
  pattern: BreathingPattern;
  background: 'forest' | 'ocean' | 'mountain' | 'space' | 'default';
  sessionDuration: number;
}

export interface CompletedSession {
  id: string;
  date: string; // ISO date string
  durationSeconds: number;
  patternName: string;
  completedFull: boolean;
}

export interface MeditationGoal {
  dailyMinutes: number;
}

export type Phase = 'inhale' | 'hold' | 'exhale' | 'pause';

export const BREATHING_PRESETS: BreathingPattern[] = [
  { name: 'Box Breathing', inhaleTime: 4, holdTime: 4, exhaleTime: 4, pauseTime: 4 },
  { name: 'Relaxing 4-7-8', inhaleTime: 4, holdTime: 7, exhaleTime: 8, pauseTime: 0 },
  { name: 'Deep Calm', inhaleTime: 6, holdTime: 0, exhaleTime: 6, pauseTime: 0 },
  { name: 'Energizing', inhaleTime: 2, holdTime: 2, exhaleTime: 2, pauseTime: 0 },
  { name: 'Custom', inhaleTime: 4, holdTime: 4, exhaleTime: 4, pauseTime: 1 },
];
