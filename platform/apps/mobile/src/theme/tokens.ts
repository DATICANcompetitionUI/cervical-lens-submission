/**
 * CervicalLens mobile design tokens.
 * Mirrors platform/apps/web/src/app/globals.css so both surfaces share one
 * visual identity (Stitch "Fintech Command Center" / "Banker's Ledger" system).
 * React Native has no Tailwind, so this is the StyleSheet equivalent.
 */
export const colors = {
  primary: "#005cb9",
  onPrimary: "#ffffff",
  primaryContainer: "#5196fe",
  onPrimaryContainer: "#002e62",

  secondary: "#a73917",
  onSecondary: "#ffffff",
  secondaryContainer: "#fe7951",
  onSecondaryContainer: "#6b1900",

  tertiary: "#5d5e62",
  tertiaryContainer: "#95969a",

  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",

  background: "#f9f9ff",
  onBackground: "#191c22",
  surface: "#f9f9ff",
  onSurface: "#191c22",
  surfaceVariant: "#e1e2eb",
  onSurfaceVariant: "#414753",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f3fc",
  surfaceContainer: "#ecedf6",
  surfaceContainerHigh: "#e6e8f1",

  outline: "#727784",
  outlineVariant: "#c1c6d5",

  // named neutrals used directly in the Stitch screens
  parchment: "#f2f1ec",
  sand: "#e1dfd8",
  midnight: "#101828",
  graphite: "#27272a",
  steel: "#6e6e6e",
  ash: "#797876",
  fog: "#a3a3a3",
} as const;

export const radius = {
  card: 24,
  pill: 9999,
  input: 12.8,
  badge: 12.8,
  icon: 12,
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  gutter: 24,
  margin: 24,
  sectionSm: 64,
  sectionLg: 80,
} as const;

export const type = {
  display: { fontSize: 40, fontWeight: "600" as const, letterSpacing: -0.8 },
  heading: { fontSize: 32, fontWeight: "600" as const, letterSpacing: -0.6 },
  headingSm: { fontSize: 24, fontWeight: "600" as const, letterSpacing: -0.3 },
  subheading: { fontSize: 18, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  bodySm: { fontSize: 14, fontWeight: "400" as const },
  caption: { fontSize: 12, fontWeight: "400" as const },
  statLg: { fontSize: 40, fontWeight: "700" as const, letterSpacing: -0.6 },
} as const;

/** Risk/status colors shared with the web RiskBadge semantics. */
export const risk = {
  low: { bg: colors.primaryContainer + "22", fg: colors.primary },
  medium: { bg: colors.secondaryContainer + "33", fg: colors.secondary },
  high: { bg: colors.secondary + "22", fg: colors.secondary },
  critical: { bg: colors.error, fg: colors.onError },
} as const;
