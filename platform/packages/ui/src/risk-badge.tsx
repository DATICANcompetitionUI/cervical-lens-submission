import type { RiskLevel } from "@cervical-lens/shared";
import { cn } from "./utils";

interface RiskBadgeProps {
  risk: RiskLevel;
  className?: string;
}

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-primary/10 text-primary",
  medium: "bg-secondary-container/20 text-secondary",
  high: "bg-secondary/15 text-secondary",
  critical: "bg-error text-on-error",
};

const riskLabels: Record<RiskLevel, string> = {
  low: "Low Risk",
  medium: "Moderate Risk",
  high: "High Risk",
  critical: "Critical",
};

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold font-sans",
        riskStyles[risk],
        className
      )}
    >
      {riskLabels[risk]}
    </span>
  );
}
