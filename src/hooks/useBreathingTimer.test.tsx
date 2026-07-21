import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

import { getTimelinePosition, useBreathingTimer } from './useBreathingTimer';

const phases = [
  { key: 'inhale' as const, label: 'Inhale', cue: 'Breathe in', durationSeconds: 4 },
  { key: 'hold' as const, label: 'Hold', cue: 'Hold', durationSeconds: 7 },
  { key: 'exhale' as const, label: 'Exhale', cue: 'Breathe out', durationSeconds: 8 },
];

describe('useBreathingTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves through phases based on elapsed timestamp', () => {
    let latest!: ReturnType<typeof useBreathingTimer>;

    function Probe() {
      latest = useBreathingTimer({ phases, rounds: 2 });
      return null;
    }

    act(() => {
      TestRenderer.create(<Probe />);
    });

    act(() => {
      jest.setSystemTime(new Date('2026-01-01T00:00:05Z'));
      jest.advanceTimersByTime(5000);
    });

    expect(latest.currentPhase.key).toBe('hold');
    expect(latest.currentRound).toBe(1);

    act(() => {
      jest.setSystemTime(new Date('2026-01-01T00:00:20Z'));
      jest.advanceTimersByTime(33000);
    });

    expect(latest.status).toBe('completed');
    expect(latest.completedRounds).toBe(2);
  });

  it('pauses and resumes cleanly', () => {
    let latest!: ReturnType<typeof useBreathingTimer>;

    function Probe() {
      latest = useBreathingTimer({ phases, rounds: 1 });
      return null;
    }

    act(() => {
      TestRenderer.create(<Probe />);
    });

    act(() => {
      latest.pause();
    });

    const pausedPhase = latest.currentPhase.key;

    act(() => {
      jest.setSystemTime(new Date('2026-01-01T00:00:08Z'));
      jest.advanceTimersByTime(5000);
    });

    expect(latest.currentPhase.key).toBe(pausedPhase);
    expect(latest.status).toBe('paused');

    act(() => {
      latest.resume();
      jest.setSystemTime(new Date('2026-01-01T00:00:09Z'));
      jest.advanceTimersByTime(1000);
    });

    expect(latest.status).toBe('running');
  });
});

describe('getTimelinePosition', () => {
  it('returns completed state when elapsed reaches total duration', () => {
    const timeline = getTimelinePosition(phases, 1, 19);

    expect(timeline.progress).toBe(1);
    expect(timeline.phaseRemainingSeconds).toBe(0);
    expect(timeline.completedRounds).toBe(1);
  });
});
