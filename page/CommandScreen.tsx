import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { C, SPACE, RADIUS } from "../theme";
import { sendCommand } from "../api";

const COMMANDS: {
  key: string;
  label: string;
  description: string;
  danger?: boolean;
}[] = [
  { key: "docker-ps", label: "Running Containers", description: "docker ps" },
  {
    key: "docker-ps-all",
    label: "All Containers",
    description: "docker ps -a",
  },
  {
    key: "docker-stats",
    label: "Container Stats",
    description: "CPU & memory per container",
  },
  {
    key: "docker-images",
    label: "Docker Images",
    description: "docker images",
  },
  { key: "disk-usage", label: "Disk Usage", description: "df -h" },
  { key: "memory-usage", label: "Memory Usage", description: "free -h" },
  {
    key: "docker-daemon-restart",
    label: "Restart Docker Daemon",
    description: "systemctl restart docker",
    danger: true,
  },
  {
    key: "reboot",
    label: "Reboot Server",
    description: "reboot (via host agent)",
    danger: true,
  },
];

export default function CommandsScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [output, setOutput] = useState<{
    title: string;
    text: string;
    success: boolean;
  } | null>(null);
  const [confirm, setConfirm] = useState<(typeof COMMANDS)[0] | null>(null);

  async function run(cmd: (typeof COMMANDS)[0]) {
    setConfirm(null);
    setLoading(cmd.key);
    const result = await sendCommand(cmd.key);
    setLoading(null);
    setOutput({
      title: cmd.label,
      text: result.output,
      success: result.success,
    });
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.serverName}>Commands</Text>
          <Text style={styles.subtitle}>Run actions on your home server</Text>
        </View>
      </View>

      {/* ── Command list ── */}
      <Text style={styles.sectionLabel}>Available Commands</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {COMMANDS.map((cmd, i) => {
            const isLast = i === COMMANDS.length - 1;
            const isLoading = loading === cmd.key;
            const color = cmd.danger ? C.rose : C.cyan;

            return (
              <TouchableOpacity
                key={cmd.key}
                style={[styles.commandRow, isLast && { borderBottomWidth: 0 }]}
                onPress={() => (cmd.danger ? setConfirm(cmd) : run(cmd))}
                disabled={loading !== null}
                activeOpacity={0.7}
              >
                {/* Bullet dot */}
                <View style={[styles.serviceDot, { backgroundColor: color }]} />

                {/* Label + description */}
                <View style={styles.commandLeft}>
                  <Text
                    style={[
                      styles.serviceName,
                      { color: cmd.danger ? C.rose : C.text },
                    ]}
                  >
                    {cmd.label}
                  </Text>
                  <Text style={styles.commandDesc}>{cmd.description}</Text>
                </View>

                {/* Right side */}
                {isLoading ? (
                  <ActivityIndicator color={color} size="small" />
                ) : (
                  <View
                    style={[
                      styles.statusChip,
                      { backgroundColor: cmd.danger ? "#3b0f18" : "#0e3040" },
                    ]}
                  >
                    <Text style={[styles.serviceStatus, { color }]}>
                      {cmd.danger ? "DANGER" : "RUN"}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ── Output modal ── */}
      <Modal visible={output !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.serverName}>{output?.title}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: output?.success ? "#14432a" : "#3b0f18" },
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: output?.success ? C.green : C.rose },
                  ]}
                />
                <Text
                  style={[
                    styles.badgeText,
                    { color: output?.success ? C.green : C.rose },
                  ]}
                >
                  {output?.success ? "SUCCESS" : "FAILED"}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>Output</Text>

            <ScrollView style={styles.outputBox}>
              <Text style={styles.outputText}>{output?.text}</Text>
            </ScrollView>

            <TouchableOpacity
              style={styles.refreshBtn}
              onPress={() => setOutput(null)}
            >
              <Text style={styles.refreshText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Danger confirm modal ── */}
      <Modal visible={confirm !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text
              style={[
                styles.serverName,
                { color: C.rose, marginBottom: SPACE.sm },
              ]}
            >
              ⚠ Confirm Action
            </Text>
            <Text style={styles.confirmText}>
              Are you sure you want to run{"\n"}
              <Text style={{ color: C.text, fontWeight: "700" }}>
                {confirm?.label}
              </Text>
              ?
            </Text>
            <Text
              style={[
                styles.subtitle,
                { textAlign: "center", marginBottom: SPACE.xl },
              ]}
            >
              This action cannot be undone.
            </Text>
            <View style={styles.confirmBtns}>
              <TouchableOpacity
                style={[
                  styles.refreshBtn,
                  { flex: 1, marginBottom: 0, marginTop: 0 },
                ]}
                onPress={() => setConfirm(null)}
              >
                <Text style={styles.refreshText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.refreshBtn,
                  {
                    flex: 1,
                    marginBottom: 0,
                    marginTop: 0,
                    backgroundColor: "#3b0f18",
                    borderColor: C.rose,
                  },
                ]}
                onPress={() => confirm && run(confirm)}
              >
                <Text style={[styles.refreshText, { color: C.rose }]}>
                  Run it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Layout (matches App.tsx exactly) ──────────────────────────────────────
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
  card: {
    backgroundColor: C.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: SPACE.lg,
    paddingVertical: SPACE.xs,
    marginBottom: SPACE.md,
  },
  serviceDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACE.sm },
  serviceName: { flex: 1, color: C.text, fontSize: 14 },
  statusChip: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACE.sm,
    paddingVertical: 3,
  },
  serviceStatus: { fontSize: 10, fontWeight: "600" },
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

  // ── Command-specific ───────────────────────────────────────────────────────
  commandRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACE.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: C.divider,
  },
  commandLeft: { flex: 1 },
  commandDesc: {
    fontSize: 11,
    color: C.muted,
    fontFamily: "monospace",
    marginTop: 2,
  },

  // ── Modals ─────────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: C.surface,
    borderTopLeftRadius: RADIUS.card + 6,
    borderTopRightRadius: RADIUS.card + 6,
    padding: SPACE.xl,
    maxHeight: "75%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACE.md,
  },
  outputBox: {
    backgroundColor: "#060e1a",
    borderRadius: RADIUS.card - 4,
    padding: SPACE.md,
    maxHeight: 280,
    marginBottom: SPACE.md,
  },
  outputText: {
    color: "#a3e635",
    fontSize: 11,
    fontFamily: "monospace",
    lineHeight: 18,
  },
  confirmText: {
    color: C.muted,
    fontSize: 15,
    textAlign: "center",
    marginBottom: SPACE.sm,
  },
  confirmBtns: { flexDirection: "row", gap: SPACE.sm },
});
