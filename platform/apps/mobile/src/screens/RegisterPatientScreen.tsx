import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { registerPatient } from "../api/client";

export default function RegisterPatientScreen({ navigation }: any) {
  const [patientCode, setPatientCode] = useState("");
  const [age, setAge] = useState("");
  const [region, setRegion] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!patientCode.trim()) {
      Alert.alert("Patient ID required", "Enter a patient code to register.");
      return;
    }
    setSubmitting(true);
    try {
      await registerPatient({
        patient_code: patientCode.trim(),
        age: age ? Number(age) : undefined,
        region: region || undefined,
        clinic_name: clinicName || undefined,
      });
      Alert.alert("Patient registered", `${patientCode} has been added.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert("Registration failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Register Patient</Text>

      <Field label="Patient ID *" value={patientCode} onChangeText={setPatientCode} placeholder="P-4921" />
      <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" placeholder="34" />
      <Field label="Region" value={region} onChangeText={setRegion} placeholder="Ibadan North" />
      <Field label="Clinic" value={clinicName} onChangeText={setClinicName} placeholder="Community Health Unit A" />

      <TouchableOpacity style={styles.submitButton} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.submitText}>Register Patient</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.fog}
        keyboardType={props.keyboardType}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.margin, paddingTop: 32, paddingBottom: 80 },
  title: { ...t.heading, color: colors.midnight, marginBottom: spacing.gutter },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...t.bodySm, color: colors.onSurfaceVariant, marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.fog,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...t.body,
    color: colors.onSurface,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.md,
  },
  submitText: { color: colors.onPrimary, ...t.subheading },
});
