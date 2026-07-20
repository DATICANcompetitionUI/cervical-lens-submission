import type { RiskLevel } from "../types";

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Medium Risk",
  high: "High Risk",
  critical: "Critical",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "vibrant-green",
  medium: "warm-accent-orange",
  high: "primary-purple",
  critical: "primary-purple",
};
