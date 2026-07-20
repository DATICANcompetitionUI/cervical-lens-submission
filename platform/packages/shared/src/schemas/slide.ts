import { z } from "zod";

export const riskLevelSchema = z.enum(["low", "medium", "high", "critical"]);

export const slideStatusSchema = z.enum([
  "pending_inference",
  "inference_complete",
  "flagged_for_review",
  "under_review",
  "review_complete",
  "archived",
]);

export const cellClassificationSchema = z.enum([
  "NILM",
  "ASC-US",
  "ASC-H",
  "LSIL",
  "HSIL",
  "SCC",
  "AGC",
]);

export const inferenceResultSchema = z.object({
  classification: cellClassificationSchema,
  confidence_score: z.number().min(0).max(1),
  risk_level: riskLevelSchema,
  predictions: z.record(z.string(), z.number()),
  inference_time_ms: z.number().int(),
  model_version: z.string(),
  roi_data: z.array(z.record(z.string(), z.unknown())).optional(),
});

export type InferenceResultInput = z.infer<typeof inferenceResultSchema>;
