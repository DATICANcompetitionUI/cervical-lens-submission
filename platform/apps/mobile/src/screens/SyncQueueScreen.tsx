/**
 * Sync Queue — connectivity + offline-upload status.
 *
 * NOTE: there is no local offline-write queue yet (would need expo-sqlite or
 * similar + a sync engine). Today, capture/register calls hit the API
 * directly and fail visibly if offline. This screen honestly reflects that:
 * "online, nothing queued" rather than fabricating fake pending uploads.
 * Building the actual offline queue is the natural next step.
 */
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { API_BASE } from "../api/client";

export default function SyncQueueScreen() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch(`${API_BASE.replace("/api/v1", "")}/health`)
      .then((r) => setOnline(r.ok))
      .catch(() => setOnline(false));
  }, []);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sync</Text>

      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: online ? colors.primary : colors.error }]} />
        <Text style={styles.statusText}>
          {online === null ? "Checking connection…" : online ? "Online" : "Offline"}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Pending uploads</Text>
        <Text style={styles.cardValue}>0</Text>
        <Text style={styles.cardNote}>
          Captures and registrations sync immediately when the device is online.
          Offline queueing for field use without connectivity is planned.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.margin, paddingTop: 48 },
  title: { ...t.heading, color: colors.midnight, marginBottom: spacing.gutter },
  statusRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.gutter },
  dot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { ...t.subheading, color: colors.midnight },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: spacing.md,
  },
  cardLabel: { ...t.bodySm, color: colors.steel, marginBottom: 4 },
  cardValue: { ...t.statLg, color: colors.midnight, marginBottom: spacing.sm },
  cardNote: { ...t.bodySm, color: colors.onSurfaceVariant },
});
