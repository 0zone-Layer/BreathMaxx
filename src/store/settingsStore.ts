import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AppTheme = 'light' | 'dark';
export type VoiceAccent = 'default' | 'en-US' | 'en-GB' | 'en-IN';
export type SoundTheme = 'chime' | 'bowl';

export type SettingsState = {
  voiceEnabled: boolean;
  voiceAccent: VoiceAccent;
  voiceRate: number;
  voicePitch: number;
  soundTheme: SoundTheme;
  hapticsEnabled: boolean;
  ambientEnabled: boolean;
  theme: AppTheme;
  toggleVoiceEnabled: () => void;
  setVoiceAccent: (accent: VoiceAccent) => void;
  setVoiceRate: (rate: number) => void;
  setVoicePitch: (pitch: number) => void;
  setSoundTheme: (theme: SoundTheme) => void;
  toggleHapticsEnabled: () => void;
  toggleAmbientEnabled: () => void;
  toggleTheme: () => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      voiceEnabled: true,
      voiceAccent: 'default',
      voiceRate: 1,
      voicePitch: 1,
      soundTheme: 'chime',
      hapticsEnabled: true,
      ambientEnabled: false,
      theme: 'light',
      toggleVoiceEnabled: () => set((state) => ({ voiceEnabled: !state.voiceEnabled })),
      setVoiceAccent: (voiceAccent) => set({ voiceAccent }),
      setVoiceRate: (voiceRate) => set({ voiceRate }),
      setVoicePitch: (voicePitch) => set({ voicePitch }),
      setSoundTheme: (soundTheme) => set({ soundTheme }),
      toggleHapticsEnabled: () => set((state) => ({ hapticsEnabled: !state.hapticsEnabled })),
      toggleAmbientEnabled: () => set((state) => ({ ambientEnabled: !state.ambientEnabled })),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'breathmaxx-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
