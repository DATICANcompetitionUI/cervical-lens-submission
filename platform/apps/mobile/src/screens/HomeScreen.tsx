import { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { apiGet } from "../api/client";

interface SlideStats {
  total_slides: number;
  pending_inference: number;
  flagged_for_review: number;
}

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState<SlideStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<SlideStats>("/slides/stats");
      setStats(data);
    } catch {
      setStats({ total_slides: 0, pending_inference: 0, flagged_for_review: 0 });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.greeting}>Good morning</Text>

      <View style={styles.syncBanner}>
        <Text style={styles.syncText}>Offline queue synced automatically when online</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.syncLink}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <StatTile label="Screened" value={stats?.total_slides ?? 0} />
        <StatTile label="Pending AI" value={stats?.pending_inference ?? 0} />
        <StatTile label="Flagged" value={stats?.flagged_for_review ?? 0} accent />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate("Capture")}
      >
        <Text style={styles.primaryButtonText}>+ New Screening</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => navigation.navigate("RegisterPatient")}
      >
        <Text style={styles.outlineButtonText}>+ Register Patient</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function StatTile({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={styles.statTile}>
      <Text style={[styles.statValue, accent && { color: colors.secondary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.margin, paddingTop: 64, paddingBottom: 100 },
  greeting: { ...t.heading, color: colors.midnight, marginBottom: spacing.md },
  syncBanner: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.sand,
    borderRadius: radius.input,
    padding: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sectionSm / 2,
  },
  syncText: { ...t.bodySm, color: colors.onSurface, flex: 1, marginRight: spacing.sm },
  syncLink: { ...t.bodySm, color: colors.primary, fontWeight: "600" },
  statsGrid: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.sectionSm / 2 },
  statTile: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.fog + "50",
    padding: spacing.md,
  },
  statValue: { ...t.statLg, color: colors.midnight },
  statLabel: { ...t.caption, color: colors.steel, marginTop: 4 },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  primaryButtonText: { color: colors.onPrimary, ...t.subheading },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.midnight,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  outlineButtonText: { color: colors.midnight, ...t.subheading },
});
