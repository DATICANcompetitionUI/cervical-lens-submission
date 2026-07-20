import type { CellClassification, RiskLevel } from "./slide";

export interface InferenceResult {
  classification: CellClassification;
  confidence: number;
  risk_level: RiskLevel;
  predictions: Record<string, number>;
  inference_time_ms: number;
  should_flag: boolean;
}
