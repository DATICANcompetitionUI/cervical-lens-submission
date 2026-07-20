import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import type { CytologyResult } from "../api/client";

export default function ScreeningResultScreen({ route, navigation }: any) {
  const { result, imageUri } = route.params as { result: CytologyResult; imageUri?: string };
  const abnormal = result.label === "Abnormal";

  return (
    <View style={[styles.screen, { backgroundColor: abnormal ? colors.errorContainer : colors.primaryContainer }]}>
      <View style={styles.content}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.thumb} />}

        <Text style={styles.icon}>{abnormal ? "!" : "✓"}</Text>
        <Text style={[styles.label, { color: abnormal ? colors.onErrorContainer : colors.onPrimaryContainer }]}>
          {result.label === "NILM" ? "NILM" : "ABNORMAL"}
        </Text>
        <Text style={styles.confidence}>
          {(result.abnormal_probability * (abnormal ? 1 : 1) * 100).toFixed(0)}% confidence
        </Text>

        <View style={styles.nextCard}>
          <Text style={styles.nextLabel}>NEXT STEP</Text>
          <Text style={styles.nextText}>
            {abnormal
              ? "Refer for pathologist review. Do not delay follow-up."
              : "Negative — routine re-screen per local guidelines."}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, abnormal && styles.saveButtonDark]}
          onPress={() => navigation.navigate("Tabs")}
        >
          <Text style={[styles.saveButtonText, abnormal && { color: colors.onError }]}>
            {abnormal ? "Save & Flag for Review" : "Save & Queue"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.retakeButton} onPress={() => navigation.replace("Capture")}>
          <Text style={styles.retakeText}>Re-capture</Text>
        </TouchableOpacity>

        <Text style={styles.modelNote}>{result.model}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.margin },
  thumb: { width: 96, height: 96, borderRadius: radius.input, marginBottom: spacing.md },
  icon: { fontSize: 56, fontWeight: "700", marginBottom: spacing.xs, color: colors.onPrimaryContainer },
  label: { ...t.heading, marginBottom: 4 },
  confidence: { ...t.body, color: colors.onSurfaceVariant, marginBottom: spacing.sectionSm / 2 },
  nextCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.card,
    padding: spacing.md,
    width: "100%",
    marginBottom: spacing.md,
  },
  nextLabel: { ...t.caption, color: colors.steel, fontWeight: "700", marginBottom: 4, letterSpacing: 1 },
  nextText: { ...t.body, color: colors.onSurface },
  saveButton: {
    backgroundColor: colors.midnight,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    width: "100%",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  saveButtonDark: { backgroundColor: colors.error },
  saveButtonText: { color: colors.parchment, ...t.subheading },
  retakeButton: { paddingVertical: spacing.sm },
  retakeText: { ...t.body, color: colors.onSurfaceVariant },
  modelNote: { ...t.caption, color: colors.onSurfaceVariant, marginTop: spacing.md, opacity: 0.7 },
});
