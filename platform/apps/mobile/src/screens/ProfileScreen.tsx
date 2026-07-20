import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { clearToken } from "../api/client";
import { useAuth } from "../navigation/AuthContext";

export default function ProfileScreen() {
  const { signOut: signOutOfApp } = useAuth();

  const signOut = async () => {
    await clearToken();
    signOutOfApp();
  };

  return (
    <View style={styles.screen}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>HW</Text>
      </View>
      <Text style={styles.name}>Health Worker</Text>
      <Text style={styles.sub}>CervicalLens field app</Text>

      <View style={styles.card}>
        <Row label="Model — imaging" value="cervicallens_edge v1" />
        <Row label="Model — genomics" value="risk_v1 (C-index 0.66)" />
        <Row label="App version" value="0.1.0" />
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.margin, paddingTop: 64, alignItems: "center" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: { ...t.subheading, color: colors.midnight },
  name: { ...t.headingSm, color: colors.midnight },
  sub: { ...t.bodySm, color: colors.steel, marginBottom: spacing.gutter },
  card: {
    width: "100%",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.sand,
    padding: spacing.md,
    marginBottom: spacing.gutter,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand,
  },
  rowLabel: { ...t.bodySm, color: colors.steel },
  rowValue: { ...t.bodySm, color: colors.onSurface, fontWeight: "600" },
  signOutButton: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.gutter,
  },
  signOutText: { color: colors.error, ...t.subheading },
});
