import type { SlideStatus } from "@cervical-lens/shared";
import { cn } from "./utils";

interface StatusBadgeProps {
  status: SlideStatus;
  className?: string;
}

const statusConfig: Record<SlideStatus, { label: string; className: string }> = {
  pending_inference: {
    label: "Pending AI",
    className: "bg-surface-container-high text-on-surface-variant",
  },
  inference_complete: {
    label: "AI Complete",
    className: "bg-primary/10 text-primary",
  },
  flagged_for_review: {
    label: "Needs Review",
    className: "bg-secondary-container/20 text-secondary",
  },
  under_review: {
    label: "Under Review",
    className: "bg-primary-container/30 text-on-primary-container",
  },
  review_complete: {
    label: "Reviewed",
    className: "bg-tertiary-container/30 text-on-tertiary-container",
  },
  archived: {
    label: "Archived",
    className: "bg-surface-container text-outline",
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold font-sans",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
