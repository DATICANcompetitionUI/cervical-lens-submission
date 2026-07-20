import type { CellClassification } from "./slide";

export type ReviewDecision =
  | "agree_with_ai"
  | "disagree_upgrade"
  | "disagree_downgrade"
  | "inconclusive";

export interface Review {
  id: number;
  slide_id: number;
  pathologist_id: number;
  classification: CellClassification;
  decision: ReviewDecision;
  confidence?: string;
  notes?: string;
  recommended_action?: string;
  is_urgent: boolean;
  review_duration_seconds?: number;
  started_at?: string;
  completed_at: string;
  created_at: string;
}

export interface ReviewCreate {
  slide_id: number;
  classification: CellClassification;
  decision: ReviewDecision;
  confidence?: string;
  notes?: string;
  recommended_action?: string;
  is_urgent: boolean;
  review_duration_seconds?: number;
}
