import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { WidgetPreview } from 'react-native-android-widget';
import { HomeServerHealthWidget, type ServerData, type ServiceStatus } from './widgets/HomeServerHealthWidget';
import { fetchServerData } from './api';

const SERVER_NAME = process.env.EXPO_PUBLIC_SERVER_NAME ?? 'Home Server';

const C = {
  bg: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  text: '#f1f5f9',
  muted: '#94a3b8',
  cyan: '#22d3ee',
  green: '#4ade80',
  amber: '#fbbf24',
  rose: '#fb7185',
};

function dotColor(s: ServiceStatus) {
  return s === 'ONLINE' ? C.green : s === 'OFFLINE' ? C.rose : C.amber;
}

function ServiceRow({ name, status }: { name: string; status: ServiceStatus }) {
  const color = dotColor(status);
  return (
    <View style={styles.serviceRow}>
      <View style={[styles.serviceDot, { backgroundColor: color }]} />
      <Text style={styles.serviceName}>{name}</Text>
      <Text style={[styles.serviceStatus, { color }]}>{status}</Text>
    </View>
  );
}

export default function App() {
  const [data, setData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    const d = await fetchServerData();
    setData(d);
    setLoading(false);

    if (Platform.OS === 'android') {
      await requestWidgetUpdate({
        widgetName: 'HomeServerHealth',
        renderWidget: () => <HomeServerHealthWidget data={d} />,
        widgetNotFound: () => {},
      });
    }
  }

  useEffect(() => { refresh(); }, []);

  const allGood = data?.allOnline ?? false;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.serverName}>{SERVER_NAME}</Text>
          <Text style={styles.subtitle}>Status Dashboard</Text>
        </View>
        {data && (
          <View style={[styles.badge, { backgroundColor: allGood ? '#14432a' : '#3b0f18' }]}>
            <View style={[styles.dot, { backgroundColor: allGood ? C.green : C.rose }]} />
            <Text style={[styles.badgeText, { color: allGood ? C.green : C.rose }]}>
              {data.onlineCount}/{data.totalCount} online
            </Text>
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Widget preview */}
        <Text style={styles.sectionLabel}>Widget Preview</Text>
        <View style={styles.previewContainer}>
          <WidgetPreview
            renderWidget={() => <HomeServerHealthWidget data={data ?? undefined} />}
            height={480}
            width={180}
          />
        </View>

        {/* Services list */}
        <Text style={styles.sectionLabel}>Services</Text>
        <View style={styles.card}>
          {data && Object.keys(data.services).length > 0 ? (
            Object.entries(data.services).map(([name, status]) => (
              <ServiceRow key={name} name={name} status={status} />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {loading ? 'Fetching status…' : 'No services found'}
            </Text>
          )}
        </View>

        {data?.lastChecked && (
          <Text style={styles.updatedAt}>Last updated at {data.lastChecked}</Text>
        )}
      </ScrollView>

      {/* Refresh */}
      <TouchableOpacity style={styles.refreshBtn} onPress={refresh} disabled={loading}>
        {loading
          ? <ActivityIndicator color={C.bg} size="small" />
          : <Text style={styles.refreshText}>Refresh Now</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 20, paddingTop: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  serverName: { fontSize: 22, fontWeight: '700', color: C.text },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  sectionLabel: { fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  previewContainer: { alignItems: 'center', marginBottom: 24 },
  card: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 12 },
  serviceRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  serviceDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  serviceName: { flex: 1, color: C.text, fontSize: 14, textTransform: 'capitalize' },
  serviceStatus: { fontSize: 11, fontWeight: '600' },
  emptyText: { color: C.muted, fontSize: 13, paddingVertical: 16, textAlign: 'center' },
  updatedAt: { textAlign: 'center', fontSize: 11, color: C.muted, marginBottom: 16 },
  refreshBtn: { backgroundColor: C.cyan, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 20, marginTop: 8 },
  refreshText: { color: C.bg, fontSize: 15, fontWeight: '700' },
});
