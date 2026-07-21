import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BreathingCircle } from '../components/BreathingCircle';
import { useBreathingTimer } from '../hooks/useBreathingTimer';
import { useSettingsStore } from '../store/settingsStore';
import { SessionConfig } from '../types/breathing';

type Props = {
  config: SessionConfig;
  onStop: () => void;
  onComplete: (completedRounds: number, totalDurationSeconds: number) => void;
};

const CHIME_ASSET = require('../../assets/audio/phase-chime.wav');
const COMPLETE_ASSET = require('../../assets/audio/session-complete.wav');
const AMBIENT_ASSET = require('../../assets/audio/ambient-rain.wav');

export function SessionScreen({ config, onStop, onComplete }: Props) {
  const { phases, rounds } = config;
  const { voiceEnabled, voiceAccent, voicePitch, voiceRate, hapticsEnabled, ambientEnabled } = useSettingsStore();

  const timer = useBreathingTimer({ phases, rounds, autoStart: true });
  const phaseSoundRef = useRef<Audio.Sound | null>(null);
  const completeSoundRef = useRef<Audio.Sound | null>(null);
  const ambientSoundRef = useRef<Audio.Sound | null>(null);
  const lastSpokenAtRef = useRef(0);
  const lastPhaseIndexRef = useRef(-1);

  useEffect(() => {
    let mounted = true;

    const preload = async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const [phaseSound, completeSound, ambientSound] = await Promise.all([
        Audio.Sound.createAsync(CHIME_ASSET),
        Audio.Sound.createAsync(COMPLETE_ASSET),
        Audio.Sound.createAsync(AMBIENT_ASSET, { isLooping: true, volume: 0.25 }),
      ]);

      if (!mounted) {
        await Promise.all([phaseSound.sound.unloadAsync(), completeSound.sound.unloadAsync(), ambientSound.sound.unloadAsync()]);
        return;
      }

      phaseSoundRef.current = phaseSound.sound;
      completeSoundRef.current = completeSound.sound;
      ambientSoundRef.current = ambientSound.sound;

      if (ambientEnabled) {
        await ambientSound.sound.replayAsync();
      }
    };

    preload().catch(() => undefined);

    return () => {
      mounted = false;
      phaseSoundRef.current?.unloadAsync().catch(() => undefined);
      completeSoundRef.current?.unloadAsync().catch(() => undefined);
      ambientSoundRef.current?.unloadAsync().catch(() => undefined);
      Speech.stop();
    };
  }, [ambientEnabled]);

  useEffect(() => {
    const currentPhaseChanged = lastPhaseIndexRef.current !== timer.currentPhaseIndex;
    if (!currentPhaseChanged || timer.status !== 'running') {
      return;
    }

    lastPhaseIndexRef.current = timer.currentPhaseIndex;

    phaseSoundRef.current?.replayAsync().catch(() => undefined);

    if (hapticsEnabled) {
      const hapticType = timer.currentPhase.key === 'hold' || timer.currentPhase.key === 'exhale-hold'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
      Haptics.impactAsync(hapticType).catch(() => undefined);
    }

    if (voiceEnabled) {
      const now = Date.now();
      if (now - lastSpokenAtRef.current > 350) {
        Speech.stop();
        Speech.speak(timer.currentPhase.cue, {
          language: voiceAccent === 'default' ? undefined : voiceAccent,
          pitch: voicePitch,
          rate: voiceRate,
        });
        lastSpokenAtRef.current = now;
      }
    }
  }, [hapticsEnabled, timer.currentPhase, timer.currentPhaseIndex, timer.status, voiceAccent, voiceEnabled, voicePitch, voiceRate]);

  useEffect(() => {
    if (timer.status === 'completed') {
      completeSoundRef.current?.replayAsync().catch(() => undefined);
      onComplete(timer.completedRounds, timer.totalDurationSeconds);
    }
  }, [onComplete, timer.completedRounds, timer.status, timer.totalDurationSeconds]);

  useEffect(() => {
    if (!ambientSoundRef.current) {
      return;
    }

    if (ambientEnabled && timer.status === 'running') {
      ambientSoundRef.current.replayAsync().catch(() => undefined);
    } else {
      ambientSoundRef.current.pauseAsync().catch(() => undefined);
    }
  }, [ambientEnabled, timer.status]);

  return (
    <View style={styles.container}>
      <Text style={styles.technique}>{config.technique.toUpperCase()}</Text>
      <BreathingCircle
        phaseKey={timer.currentPhase.key}
        progress={timer.progress}
        phaseDurationSeconds={timer.currentPhase.durationSeconds}
      />
      <Text accessibilityLabel="Current phase label" style={styles.phaseLabel}>
        {timer.currentPhase.label}
      </Text>
      <Text accessibilityLabel="Current phase countdown" style={styles.countdown}>
        {timer.phaseRemainingSeconds}
      </Text>
      <Text style={styles.progressText}>
        Round {Math.min(timer.currentRound, rounds)} / {rounds}
      </Text>

      <View style={styles.controls}>
        {timer.status === 'running' ? (
          <Pressable accessibilityLabel="Pause session" onPress={timer.pause} style={styles.controlButton}>
            <Text style={styles.controlText}>Pause</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityLabel="Resume session" onPress={timer.resume} style={styles.controlButton}>
            <Text style={styles.controlText}>Resume</Text>
          </Pressable>
        )}

        <Pressable
          accessibilityLabel="Stop session"
          onPress={() => {
            timer.stop();
            onStop();
          }}
          style={[styles.controlButton, styles.stopButton]}
        >
          <Text style={styles.controlText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    padding: 20,
  },
  technique: {
    color: '#4B5B6A',
    letterSpacing: 2,
  },
  phaseLabel: {
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  countdown: {
    fontSize: 56,
    fontWeight: '800',
  },
  progressText: {
    fontSize: 16,
    color: '#4C5969',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  controlButton: {
    minWidth: 120,
    minHeight: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D7FF9',
  },
  stopButton: {
    backgroundColor: '#CB2F2F',
  },
  controlText: {
    color: '#fff',
    fontWeight: '700',
  },
});
