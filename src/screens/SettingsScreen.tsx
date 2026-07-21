import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useSettingsStore, VoiceAccent } from '../store/settingsStore';

const ACCENTS: VoiceAccent[] = ['default', 'en-US', 'en-GB', 'en-IN'];

export function SettingsScreen() {
  const {
    voiceEnabled,
    voiceAccent,
    voiceRate,
    voicePitch,
    soundTheme,
    hapticsEnabled,
    ambientEnabled,
    theme,
    toggleVoiceEnabled,
    setVoiceAccent,
    setVoiceRate,
    setVoicePitch,
    setSoundTheme,
    toggleHapticsEnabled,
    toggleAmbientEnabled,
    toggleTheme,
  } = useSettingsStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <SettingRow label="Voice guidance">
        <Switch value={voiceEnabled} onValueChange={toggleVoiceEnabled} />
      </SettingRow>
      <SettingRow label="Haptics">
        <Switch value={hapticsEnabled} onValueChange={toggleHapticsEnabled} />
      </SettingRow>
      <SettingRow label="Ambient background">
        <Switch value={ambientEnabled} onValueChange={toggleAmbientEnabled} />
      </SettingRow>
      <SettingRow label="Theme">
        <Pressable onPress={toggleTheme} style={styles.optionChip}>
          <Text>{theme === 'light' ? 'Light' : 'Dark'}</Text>
        </Pressable>
      </SettingRow>
      <SettingRow label="Voice accent">
        <View style={styles.wrapRow}>
          {ACCENTS.map((accent) => (
            <Pressable key={accent} onPress={() => setVoiceAccent(accent)} style={[styles.optionChip, voiceAccent === accent && styles.optionChipActive]}>
              <Text style={voiceAccent === accent ? styles.optionTextActive : undefined}>{accent}</Text>
            </Pressable>
          ))}
        </View>
      </SettingRow>

      <SettingRow label="Voice rate">
        <View style={styles.wrapRow}>
          {[0.8, 1, 1.2].map((rate) => (
            <Pressable key={rate} onPress={() => setVoiceRate(rate)} style={[styles.optionChip, voiceRate === rate && styles.optionChipActive]}>
              <Text style={voiceRate === rate ? styles.optionTextActive : undefined}>{rate.toFixed(1)}x</Text>
            </Pressable>
          ))}
        </View>
      </SettingRow>
      <SettingRow label="Voice pitch">
        <View style={styles.wrapRow}>
          {[0.8, 1, 1.2].map((pitch) => (
            <Pressable key={pitch} onPress={() => setVoicePitch(pitch)} style={[styles.optionChip, voicePitch === pitch && styles.optionChipActive]}>
              <Text style={voicePitch === pitch ? styles.optionTextActive : undefined}>{pitch.toFixed(1)}</Text>
            </Pressable>
          ))}
        </View>
      </SettingRow>
      <SettingRow label="Sound theme">
        <View style={styles.wrapRow}>
          {(['chime', 'bowl'] as const).map((item) => (
            <Pressable key={item} onPress={() => setSoundTheme(item)} style={[styles.optionChip, soundTheme === item && styles.optionChipActive]}>
              <Text style={soundTheme === item ? styles.optionTextActive : undefined}>{item}</Text>
            </Pressable>
          ))}
        </View>
      </SettingRow>
    </View>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  row: {
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#95B5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  optionChipActive: {
    backgroundColor: '#2D7FF9',
    borderColor: '#2D7FF9',
  },
  optionTextActive: {
    color: '#fff',
  },
});
