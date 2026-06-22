import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { api } from './src/api/client';

type Health = { status: string; timestamp: string };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Health>('/api/health')
      .then(setHealth)
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌱 graine</Text>
      {!health && !error && <ActivityIndicator />}
      {health && (
        <Text style={styles.ok}>API connectée ✅ ({health.status})</Text>
      )}
      {error && <Text style={styles.error}>API injoignable ❌{'\n'}{error}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
  ok: { color: 'green', fontSize: 16 },
  error: { color: 'crimson', fontSize: 14, textAlign: 'center' },
});
