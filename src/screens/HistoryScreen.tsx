import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { SessionHistoryItem } from '../types/breathing';

type Props = {
  history: SessionHistoryItem[];
};

export function HistoryScreen({ history }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No sessions yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.technique.toUpperCase()}</Text>
            <Text>{new Date(item.timestamp).toLocaleString()}</Text>
            <Text>
              Duration: {item.totalDurationSeconds}s • Rounds: {item.roundsCompleted}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  empty: {
    color: '#526070',
  },
  item: {
    borderWidth: 1,
    borderColor: '#D6E4F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 2,
  },
  itemTitle: {
    fontWeight: '700',
  },
});
