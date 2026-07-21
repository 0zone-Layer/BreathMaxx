import AsyncStorage from '@react-native-async-storage/async-storage';

import { SessionHistoryItem } from '../types/breathing';

const STORAGE_KEY = 'breathmaxx-history';

export async function getHistory(): Promise<SessionHistoryItem[]> {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as SessionHistoryItem[];
    return parsed;
  } catch {
    return [];
  }
}

export async function addHistoryEntry(entry: SessionHistoryItem) {
  const items = await getHistory();
  const next = [entry, ...items].slice(0, 100);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
