/**
 * Genomics 2-axis risk scorer — pure TypeScript, zero runtime deps.
 *
 * The Python Cox model (research/genomics) is a linear predictor + exp(), so it
 * ports exactly to JS. Parameters are exported to genomics_risk_model.json by
 * models/export_genomics_json.py. Scoring:
 *
 *   z_f = (impute(x_f) - mean_f) / scale_f          // median-impute, standardize
 *   lp  = Σ coef_f · z_f                             // log partial hazard
 *   high = lp ≥ threshold                            // cohort-median split per axis
 *
 * Risk category = LOW / MODERATE / HIGH / CRITICAL from the two axes.
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

interface Axis {
  features: string[];
  median: Record<string, number>;
  mean: Record<string, number>;
  scale: Record<string, number>;
  coef: Record<string, number>;
  threshold: number;
}
interface RiskModel {
  model: string;
  endpoint: string;
  cv_cindex: number;
  n_train: number;
  axes: { virulence: Axis; metastasis: Axis };
  disclaimer: string;
}

const __dir = dirname(fileURLToPath(import.meta.url));
const model: RiskModel = JSON.parse(
  readFileSync(join(__dir, "genomics_risk_model.json"), "utf8"),
);

export type RiskCategory = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
export type GenomicFeatures = Record<string, number>;

export interface GenomicsRiskResult {
  risk_category: RiskCategory;
  virulence_score: number;
  metastasis_score: number;
  virulence_high: boolean;
  metastasis_high: boolean;
  model_cindex: number;
  endpoint: string;
  note: string;
}

function axisLinearPredictor(axis: Axis, feats: GenomicFeatures): number {
  let lp = 0;
  for (const f of axis.features) {
    const x = f in feats && Number.isFinite(feats[f]) ? feats[f] : axis.median[f];
    lp += axis.coef[f] * ((x - axis.mean[f]) / axis.scale[f]);
  }
  return lp;
}

/** Score a patient's genomic features into a 2D risk category. */
export function predictGenomicsRisk(feats: GenomicFeatures): GenomicsRiskResult {
  const vLp = axisLinearPredictor(model.axes.virulence, feats);
  const mLp = axisLinearPredictor(model.axes.metastasis, feats);
  const vHigh = vLp >= model.axes.virulence.threshold;
  const mHigh = mLp >= model.axes.metastasis.threshold;

  const risk_category: RiskCategory =
    vHigh && mHigh ? "CRITICAL" : vHigh ? "HIGH" : mHigh ? "MODERATE" : "LOW";

  return {
    risk_category,
    virulence_score: Number(Math.exp(vLp).toFixed(4)),
    metastasis_score: Number(Math.exp(mLp).toFixed(4)),
    virulence_high: vHigh,
    metastasis_high: mHigh,
    model_cindex: model.cv_cindex,
    endpoint: model.endpoint,
    note: `Prognostic risk (cross-validated C-index ${model.cv_cindex}); ${model.disclaimer}`,
  };
}

/** Metadata for a /info endpoint. */
export function genomicsModelInfo() {
  return {
    model: model.model,
    endpoint: model.endpoint,
    cv_cindex: model.cv_cindex,
    n_train: model.n_train,
    virulence_features: model.axes.virulence.features,
    metastasis_features: model.axes.metastasis.features,
    disclaimer: model.disclaimer,
  };
}
