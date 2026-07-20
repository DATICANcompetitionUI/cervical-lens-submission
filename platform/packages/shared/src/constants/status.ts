import type { SlideStatus } from "../types";

export const STATUS_LABELS: Record<SlideStatus, string> = {
  pending_inference: "Pending AI",
  inference_complete: "AI Complete",
  flagged_for_review: "Needs Review",
  under_review: "Under Review",
  review_complete: "Reviewed",
  archived: "Archived",
};

export const STATUS_COLORS: Record<SlideStatus, string> = {
  pending_inference: "subtle-text-gray",
  inference_complete: "vibrant-green",
  flagged_for_review: "warm-accent-orange",
  under_review: "primary-purple",
  review_complete: "fresh-accent-green",
  archived: "subtle-text-gray",
};
