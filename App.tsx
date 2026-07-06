import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { requestWidgetUpdate } from "react-native-android-widget";
import { WidgetPreview } from "react-native-android-widget";
import {
  HomeServerHealthWidget,
  type ServerData,
  type ServiceStatus,
} from "./widgets/HomeServerHealthWidget";
import { fetchServerData } from "./api";
import { registerBackgroundFetch } from "./background-task";
import * as BackgroundFetch from "expo-background-fetch";
import CommandsScreen from "./page/CommandScreen";
import { RADIUS, SPACE, C } from "./theme";

const SERVER_NAME = process.env.EXPO_PUBLIC_SERVER_NAME ?? "Home Server";

/* ------------------------------------------------------------------ */
/*  Same palette + spacing scale as HomeServerHealthWidget, so the    */
/*  in-app screen and the home-screen widget feel like one product.   */
/* ------------------------------------------------------------------ */

function dotColor(s: ServiceStatus) {
  return s === "ONLINE" ? C.green : s === "OFFLINE" ? C.rose : C.amber;
}

function dimColor(s: ServiceStatus) {
  return s === "ONLINE" ? C.greenDim : s === "OFFLINE" ? C.roseDim : C.amberDim;
}

function ServiceRow({ name, status }: { name: string; status: ServiceStatus }) {
  const color = dotColor(status);
  return (
    <View style={styles.serviceRow}>
      <View style={[styles.serviceDot, { backgroundColor: color }]} />
      <Text style={styles.serviceName}>{name}</Text>
      <View style={[styles.statusChip, { backgroundColor: dimColor(status) }]}>
        <Text style={[styles.serviceStatus, { color }]}>{status}</Text>
      </View>
    </View>
  );
}

export default function App() {
  const [data, setData] = useState<ServerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"status" | "commands">("status");

  async function refresh() {
    setLoading(true);
    const d = await fetchServerData();
    setData(d);
    setLoading(false);

    if (Platform.OS === "android") {
      await requestWidgetUpdate({
        widgetName: "HomeServerHealth",
        renderWidget: () => <HomeServerHealthWidget data={d} />,
        widgetNotFound: () => {},
      });
    }
  }

  useEffect(() => {
    registerBackgroundFetch();
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const allGood = data?.allOnline ?? false;
  const headerColor = data?.serverDown ? C.amber : allGood ? C.green : C.rose;
  const headerBg = data?.serverDown
    ? C.amberDim
    : allGood
      ? C.greenDim
      : C.roseDim;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: Platform.OS === "android" ? 60 : 0 },
      ]}
    >
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.serverName}>{SERVER_NAME}</Text>
          <Text style={styles.subtitle}>Status Dashboard</Text>
        </View>
        {data && (
          <View style={[styles.badge, { backgroundColor: headerBg }]}>
            <View style={[styles.dot, { backgroundColor: headerColor }]} />
            <Text style={[styles.badgeText, { color: headerColor }]}>
              {data.serverDown
                ? "DOWN"
                : `${data.onlineCount}/${data.totalCount} online`}
            </Text>
          </View>
        )}
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tab} onPress={() => setTab("status")}>
          <Text style={[styles.tabText, tab === "status" && styles.tabActive]}>
            Status
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => setTab("commands")}>
          <Text
            style={[styles.tabText, tab === "commands" && styles.tabActive]}
          >
            Commands
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Widget preview */}
        {/* <Text style={styles.sectionLabel}>Widget Preview</Text>
        <View style={styles.previewContainer}>
          <WidgetPreview
            renderWidget={() => (
              <HomeServerHealthWidget data={data ?? undefined} />
            )}
            height={480}
            width={180}
          />
        </View> */}

        {tab === "status" ? (
          <>
            {/* Services list */}
            <Text style={styles.sectionLabel}>Services</Text>
            <View style={styles.card}>
              {data && Object.keys(data.services).length > 0 ? (
                Object.entries(data.services).map(([name, status]) => (
                  <ServiceRow key={name} name={name} status={status} />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {loading ? "Fetching status…" : "No services found"}
                </Text>
              )}
            </View>

            {data?.lastChecked && (
              <Text style={styles.updatedAt}>
                Last updated at {data.lastChecked}
              </Text>
            )}
          </>
        ) : (
          <CommandsScreen />
        )}
      </ScrollView>

      {/* Refresh */}
      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={refresh}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={C.bg} size="small" />
        ) : (
          <Text style={styles.refreshText}>Refresh Now</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: SPACE.xl,
    paddingTop: SPACE.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACE.xl,
  },
  serverName: { fontSize: 22, fontWeight: "700", color: C.text },
  subtitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.sm + 2,
    paddingVertical: 5,
    gap: 5,
  },
  dot: { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  sectionLabel: {
    fontSize: 11,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACE.sm,
    marginTop: SPACE.xs,
  },
  previewContainer: { alignItems: "center", marginBottom: SPACE.xl + 4 },
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.xs,
    marginBottom: SPACE.md,
  },
  serviceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACE.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  serviceDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACE.sm },
  serviceName: {
    flex: 1,
    color: C.text,
    fontSize: 14,
    textTransform: "capitalize",
  },
  statusChip: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.sm,
    paddingVertical: 3,
  },
  serviceStatus: { fontSize: 10, fontWeight: "600" },
  emptyText: {
    color: C.muted,
    fontSize: 13,
    paddingVertical: SPACE.lg,
    textAlign: "center",
  },
  updatedAt: {
    textAlign: "center",
    fontSize: 11,
    color: C.muted,
    marginBottom: SPACE.lg,
  },
  refreshBtn: {
    backgroundColor: C.surfaceElevated,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: RADIUS.card - 4,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: SPACE.xl,
    marginTop: SPACE.sm,
  },
  refreshText: { color: C.text, fontSize: 15, fontWeight: "700" },
  tabBar: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.border },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabText: { color: C.muted, fontSize: 13, fontWeight: "600" },
  tabActive: { color: C.cyan },
});
