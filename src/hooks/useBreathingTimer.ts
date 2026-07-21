import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { BreathingPhase } from '../types/breathing';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export type UseBreathingTimerOptions = {
  phases: BreathingPhase[];
  rounds: number;
  autoStart?: boolean;
};

export type BreathingTimerState = {
  status: TimerStatus;
  currentPhase: BreathingPhase;
  currentPhaseIndex: number;
  phaseRemainingSeconds: number;
  phaseElapsedSeconds: number;
  currentRound: number;
  completedRounds: number;
  totalElapsedSeconds: number;
  totalDurationSeconds: number;
  progress: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

const TICK_MS = 100;

export function getTimelinePosition(phases: BreathingPhase[], rounds: number, elapsedSeconds: number) {
  const safePhases = phases.filter((phase) => phase.durationSeconds > 0);
  if (safePhases.length === 0) {
    throw new Error('At least one phase with positive duration is required');
  }

  const cycleDuration = safePhases.reduce((sum, phase) => sum + phase.durationSeconds, 0);
  const totalDuration = cycleDuration * rounds;
  const clampedElapsed = Math.max(0, Math.min(elapsedSeconds, totalDuration));
  const completed = clampedElapsed >= totalDuration;

  if (completed) {
    const lastPhase = safePhases[safePhases.length - 1];
    return {
      currentPhase: lastPhase,
      currentPhaseIndex: safePhases.length - 1,
      phaseElapsedSeconds: lastPhase.durationSeconds,
      phaseRemainingSeconds: 0,
      currentRound: rounds,
      completedRounds: rounds,
      totalDuration,
      totalElapsed: totalDuration,
      progress: 1,
    };
  }

  const roundIndex = Math.floor(clampedElapsed / cycleDuration);
  const secondInCycle = clampedElapsed % cycleDuration;

  let cursor = 0;
  let currentPhase = safePhases[0];
  let currentPhaseIndex = 0;

  for (let i = 0; i < safePhases.length; i += 1) {
    const phase = safePhases[i];
    if (secondInCycle < cursor + phase.durationSeconds) {
      currentPhase = phase;
      currentPhaseIndex = i;
      break;
    }

    cursor += phase.durationSeconds;
  }

  const phaseElapsedSeconds = secondInCycle - cursor;
  const phaseRemainingSeconds = Math.max(0, Math.ceil(currentPhase.durationSeconds - phaseElapsedSeconds));

  return {
    currentPhase,
    currentPhaseIndex,
    phaseElapsedSeconds,
    phaseRemainingSeconds,
    currentRound: roundIndex + 1,
    completedRounds: roundIndex,
    totalDuration,
    totalElapsed: clampedElapsed,
    progress: totalDuration === 0 ? 0 : clampedElapsed / totalDuration,
  };
}

export function useBreathingTimer({ phases, rounds, autoStart = true }: UseBreathingTimerOptions): BreathingTimerState {
  const [status, setStatus] = useState<TimerStatus>(autoStart ? 'running' : 'idle');
  const [nowMs, setNowMs] = useState(() => Date.now());

  const startTimeMsRef = useRef<number>(Date.now());
  const pausedStartedMsRef = useRef<number | null>(null);
  const pausedAccumulatedMsRef = useRef<number>(0);

  const totalDurationSeconds = useMemo(
    () => phases.filter((phase) => phase.durationSeconds > 0).reduce((sum, phase) => sum + phase.durationSeconds, 0) * rounds,
    [phases, rounds]
  );

  useEffect(() => {
    if (status !== 'running') {
      return;
    }

    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        setNowMs(Date.now());
      }
    });

    return () => subscription.remove();
  }, []);

  const elapsedSeconds = useMemo(() => {
    if (status === 'idle') {
      return 0;
    }

    const pausedDrift = pausedStartedMsRef.current ? nowMs - pausedStartedMsRef.current : 0;
    const pausedMs = pausedAccumulatedMsRef.current + pausedDrift;
    return Math.max(0, (nowMs - startTimeMsRef.current - pausedMs) / 1000);
  }, [nowMs, status]);

  const timeline = useMemo(() => {
    return getTimelinePosition(phases, rounds, elapsedSeconds);
  }, [elapsedSeconds, phases, rounds]);

  useEffect(() => {
    if (status === 'running' && timeline.progress >= 1) {
      setStatus('completed');
      setNowMs(Date.now());
    }
  }, [status, timeline.progress]);

  const start = () => {
    startTimeMsRef.current = Date.now();
    pausedStartedMsRef.current = null;
    pausedAccumulatedMsRef.current = 0;
    setNowMs(Date.now());
    setStatus('running');
  };

  const pause = () => {
    if (status !== 'running') {
      return;
    }

    pausedStartedMsRef.current = Date.now();
    setNowMs(Date.now());
    setStatus('paused');
  };

  const resume = () => {
    if (status !== 'paused') {
      return;
    }

    if (pausedStartedMsRef.current) {
      pausedAccumulatedMsRef.current += Date.now() - pausedStartedMsRef.current;
    }
    pausedStartedMsRef.current = null;
    setNowMs(Date.now());
    setStatus('running');
  };

  const stop = () => {
    pausedStartedMsRef.current = null;
    pausedAccumulatedMsRef.current = 0;
    setNowMs(Date.now());
    setStatus('idle');
  };

  return {
    status,
    currentPhase: timeline.currentPhase,
    currentPhaseIndex: timeline.currentPhaseIndex,
    phaseRemainingSeconds: timeline.phaseRemainingSeconds,
    phaseElapsedSeconds: timeline.phaseElapsedSeconds,
    currentRound: timeline.currentRound,
    completedRounds: timeline.completedRounds,
    totalElapsedSeconds: timeline.totalElapsed,
    totalDurationSeconds,
    progress: timeline.progress,
    start,
    pause,
    resume,
    stop,
  };
}
