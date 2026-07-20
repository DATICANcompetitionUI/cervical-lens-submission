import { useCallback, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { apiGet, type Patient } from "../api/client";

export default function PatientDirectoryScreen() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiGet<{ patients: Patient[] }>("/patients");
      setPatients(data.patients ?? []);
    } catch {
      setPatients([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = patients.filter((p) =>
    p.patient_code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Patients</Text>
      <TextInput
        style={styles.search}
        placeholder="Search patient ID…"
        placeholderTextColor={colors.fog}
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={filtered}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No patients yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.patient_code.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.patient_code}</Text>
              <Text style={styles.rowSub}>
                {[item.age && `${item.age}y`, item.region, item.clinic_name].filter(Boolean).join(" • ")}
              </Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.margin, paddingTop: 48 },
  title: { ...t.heading, color: colors.midnight, marginBottom: spacing.md },
  search: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.fog,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginBottom: spacing.md,
    color: colors.onSurface,
  },
  empty: { ...t.body, color: colors.steel, textAlign: "center", marginTop: spacing.sectionSm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.fog + "30",
    padding: spacing.sm,
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: colors.midnight, fontWeight: "700" },
  rowTitle: { ...t.subheading, color: colors.midnight },
  rowSub: { ...t.bodySm, color: colors.steel },
});
