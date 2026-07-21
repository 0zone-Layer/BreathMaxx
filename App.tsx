import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { HistoryScreen } from './src/screens/HistoryScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SessionScreen } from './src/screens/SessionScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { getHistory, addHistoryEntry } from './src/store/historyStore';
import { useSettingsStore } from './src/store/settingsStore';
import { SessionConfig, SessionHistoryItem } from './src/types/breathing';

type Tab = 'home' | 'session' | 'history' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const theme = useSettingsStore((state) => state.theme);

  useEffect(() => {
    getHistory().then(setHistory).catch(() => setHistory([]));
  }, []);

  const screen = useMemo(() => {
    if (activeTab === 'session' && sessionConfig) {
      return (
        <SessionScreen
          config={sessionConfig}
          onStop={() => setActiveTab('home')}
          onComplete={(roundsCompleted, totalDurationSeconds) => {
            const entry: SessionHistoryItem = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
              timestamp: new Date().toISOString(),
              technique: sessionConfig.technique,
              roundsCompleted,
              totalDurationSeconds,
            };

            addHistoryEntry(entry).catch(() => undefined);
            setHistory((previous) => [entry, ...previous]);
            setActiveTab('history');
          }}
        />
      );
    }

    if (activeTab === 'history') {
      return <HistoryScreen history={history} />;
    }

    if (activeTab === 'settings') {
      return <SettingsScreen />;
    }

    return (
      <HomeScreen
        onStart={(config) => {
          setSessionConfig(config);
          setActiveTab('session');
        }}
      />
    );
  }, [activeTab, history, sessionConfig]);

  return (
    <SafeAreaView style={[styles.safe, theme === 'dark' ? styles.darkSafe : styles.lightSafe]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.content}>{screen}</View>
      <View accessibilityLabel="Main navigation tabs" style={styles.tabBar}>
        {(
          [
            ['home', 'Home'],
            ['history', 'History'],
            ['settings', 'Settings'],
          ] as const
        ).map(([tab, label]) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${label} screen`}
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
          >
            <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  lightSafe: {
    backgroundColor: '#F8FBFF',
  },
  darkSafe: {
    backgroundColor: '#111827',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#D6E4F0',
  },
  tabItem: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#E8F0FF',
  },
  tabLabel: {
    fontWeight: '600',
    color: '#445264',
  },
  activeTabLabel: {
    color: '#1847B8',
  },
});
