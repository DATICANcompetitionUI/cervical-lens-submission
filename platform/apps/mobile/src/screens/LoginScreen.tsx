import { useState } from "react";
import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors, radius, spacing, type as t } from "../theme/tokens";
import { signIn, signUp, storeToken } from "../api/client";

export default function LoginScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const data =
        mode === "signIn"
          ? await signIn(email, password)
          : await signUp({ email, password, name, role: "technician" });
      await storeToken(data.token);
      onAuthenticated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>CervicalLens</Text>
        <Text style={styles.subtitle}>
          {mode === "signIn" ? "Sign in to continue" : "Create your field worker account"}
        </Text>

        {mode === "signUp" && (
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.fog}
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.fog}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.fog}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.primaryButton} onPress={submit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>
              {mode === "signIn" ? "Sign In" : "Create Account"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          <Text style={styles.switchText}>
            {mode === "signIn" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: "center", padding: spacing.margin },
  title: { ...t.display, fontSize: 36, color: colors.midnight, textAlign: "center", marginBottom: 4 },
  subtitle: { ...t.body, color: colors.steel, textAlign: "center", marginBottom: spacing.gutter },
  input: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.fog,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
    color: colors.onSurface,
    ...t.body,
  },
  error: { color: colors.error, ...t.bodySm, marginBottom: spacing.sm },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  primaryButtonText: { color: colors.onPrimary, ...t.subheading },
  switchButton: { marginTop: spacing.md, alignItems: "center" },
  switchText: { color: colors.primary, ...t.bodySm },
});
