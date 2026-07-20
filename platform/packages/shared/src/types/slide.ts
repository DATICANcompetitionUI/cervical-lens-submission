export type RiskLevel = "low" | "medium" | "high" | "critical";

export type SlideStatus =
  | "pending_inference"
  | "inference_complete"
  | "flagged_for_review"
  | "under_review"
  | "review_complete"
  | "archived";

export type CellClassification =
  | "NILM"
  | "ASC-US"
  | "ASC-H"
  | "LSIL"
  | "HSIL"
  | "SCC"
  | "AGC";

export interface Slide {
  id: number;
  slide_code: string;
  patient_id: number;
  captured_by: number;
  campaign_id?: number;
  status: SlideStatus;
  image_path: string;
  thumbnail_path?: string;
  image_format?: string;
  magnification?: string;
  microscope_type?: string;
  stain_type?: string;
  capture_device?: string;
  risk_level?: RiskLevel;
  confidence_score?: number;
  ai_classification?: CellClassification;
  ai_predictions?: Record<string, number>;
  roi_data?: Array<Record<string, unknown>>;
  inference_time_ms?: number;
  model_version?: string;
  captured_at: string;
  inference_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SlideListResponse {
  slides: Slide[];
  total: number;
  page: number;
  per_page: number;
}

export interface SlideSummaryStats {
  total_slides: number;
  pending_inference: number;
  flagged_for_review: number;
  under_review: number;
  review_complete: number;
  high_risk_count: number;
  avg_confidence?: number;
}
