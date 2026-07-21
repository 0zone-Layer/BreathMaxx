import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SessionConfig, TECHNIQUE_PRESETS, TechniqueType } from '../types/breathing';

type Props = {
  onStart: (config: SessionConfig) => void;
};

const TECHNIQUES: TechniqueType[] = ['4-7-8', 'kumbhaka', 'custom'];

export function HomeScreen({ onStart }: Props) {
  const [technique, setTechnique] = useState<TechniqueType>('4-7-8');
  const [rounds, setRounds] = useState('4');
  const [customDurations, setCustomDurations] = useState({ inhale: '4', hold: '4', exhale: '4', exhaleHold: '4' });

  const parsedRounds = Math.max(1, Number.parseInt(rounds, 10) || 1);

  const config = useMemo<SessionConfig>(() => {
    if (technique === '4-7-8') {
      return { ...TECHNIQUE_PRESETS['4-7-8'], rounds: parsedRounds };
    }

    if (technique === 'kumbhaka') {
      const phases = [
        {
          key: 'inhale' as const,
          label: 'Puraka (Inhale)',
          cue: 'Breathe in',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.inhale, 10) || 1),
        },
        {
          key: 'hold' as const,
          label: 'Antara Kumbhaka (Hold)',
          cue: 'Hold',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.hold, 10) || 1),
        },
        {
          key: 'exhale' as const,
          label: 'Rechaka (Exhale)',
          cue: 'Breathe out',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.exhale, 10) || 1),
        },
        {
          key: 'exhale-hold' as const,
          label: 'Bahya Kumbhaka (Hold)',
          cue: 'Hold out',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.exhaleHold, 10) || 1),
        },
      ];
      return { technique, phases, rounds: parsedRounds };
    }

    return {
      technique,
      rounds: parsedRounds,
      phases: [
        {
          key: 'inhale',
          label: 'Inhale',
          cue: 'Breathe in',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.inhale, 10) || 1),
        },
        {
          key: 'hold',
          label: 'Hold',
          cue: 'Hold',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.hold, 10) || 1),
        },
        {
          key: 'exhale',
          label: 'Exhale',
          cue: 'Breathe out',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.exhale, 10) || 1),
        },
        {
          key: 'exhale-hold',
          label: 'Exhale Hold',
          cue: 'Hold out',
          durationSeconds: Math.max(1, Number.parseInt(customDurations.exhaleHold, 10) || 1),
        },
      ],
    };
  }, [customDurations, parsedRounds, technique]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>BreathMaxx</Text>
      <Text style={styles.subtitle}>Choose your breathing technique</Text>

      <View style={styles.segmentRow}>
        {TECHNIQUES.map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item} technique`}
            onPress={() => setTechnique(item)}
            style={[styles.segment, technique === item && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, technique === item && styles.segmentTextSelected]}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.block}>
        <Text style={styles.label}>Rounds</Text>
        <TextInput accessibilityLabel="Rounds input" keyboardType="number-pad" onChangeText={setRounds} style={styles.input} value={rounds} />
      </View>

      {technique !== '4-7-8' ? (
        <View style={styles.block}>
          <Text style={styles.label}>Custom phase durations (seconds)</Text>
          {(
            [
              ['inhale', 'Inhale'],
              ['hold', 'Hold'],
              ['exhale', 'Exhale'],
              ['exhaleHold', 'Exhale Hold'],
            ] as const
          ).map(([key, label]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <TextInput
                accessibilityLabel={`${label} duration input`}
                keyboardType="number-pad"
                style={styles.smallInput}
                value={customDurations[key]}
                onChangeText={(value) => setCustomDurations((prev) => ({ ...prev, [key]: value }))}
              />
            </View>
          ))}
        </View>
      ) : null}

      <Pressable accessibilityRole="button" accessibilityLabel="Start breathing session" style={styles.startButton} onPress={() => onStart(config)}>
        <Text style={styles.startButtonText}>Start Session</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: '#4C5969',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
  },
  segment: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A8C7FA',
  },
  segmentSelected: {
    backgroundColor: '#2D7FF9',
  },
  segmentText: {
    color: '#2D7FF9',
    fontWeight: '600',
  },
  segmentTextSelected: {
    color: '#fff',
  },
  block: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6E4F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    width: 120,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: 15,
  },
  smallInput: {
    width: 90,
    borderWidth: 1,
    borderColor: '#D6E4F0',
    borderRadius: 8,
    padding: 8,
  },
  startButton: {
    backgroundColor: '#1847B8',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
