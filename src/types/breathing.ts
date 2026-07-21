export type BreathingPhaseKey = 'inhale' | 'hold' | 'exhale' | 'exhale-hold';

export type BreathingPhase = {
  key: BreathingPhaseKey;
  label: string;
  cue: string;
  durationSeconds: number;
};

export type TechniqueType = '4-7-8' | 'kumbhaka' | 'custom';

export type SessionConfig = {
  technique: TechniqueType;
  phases: BreathingPhase[];
  rounds: number;
};

export type SessionHistoryItem = {
  id: string;
  timestamp: string;
  technique: TechniqueType;
  roundsCompleted: number;
  totalDurationSeconds: number;
};

export const TECHNIQUE_PRESETS: Record<'4-7-8' | 'kumbhaka', Omit<SessionConfig, 'rounds'>> = {
  '4-7-8': {
    technique: '4-7-8',
    phases: [
      { key: 'inhale', label: 'Inhale', cue: 'Breathe in', durationSeconds: 4 },
      { key: 'hold', label: 'Hold', cue: 'Hold', durationSeconds: 7 },
      { key: 'exhale', label: 'Exhale', cue: 'Breathe out', durationSeconds: 8 },
    ],
  },
  kumbhaka: {
    technique: 'kumbhaka',
    phases: [
      { key: 'inhale', label: 'Puraka (Inhale)', cue: 'Breathe in', durationSeconds: 4 },
      { key: 'hold', label: 'Antara Kumbhaka (Hold)', cue: 'Hold', durationSeconds: 4 },
      { key: 'exhale', label: 'Rechaka (Exhale)', cue: 'Breathe out', durationSeconds: 4 },
      { key: 'exhale-hold', label: 'Bahya Kumbhaka (Hold)', cue: 'Hold out', durationSeconds: 4 },
    ],
  },
};
