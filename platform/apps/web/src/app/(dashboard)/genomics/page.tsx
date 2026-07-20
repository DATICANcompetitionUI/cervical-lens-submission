"use client";

import { useState } from "react";
import { RiskBadge } from "@cervical-lens/ui";
import type { RiskLevel } from "@cervical-lens/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface GenomicsRiskResult {
  risk_category: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  virulence_score: number;
  metastasis_score: number;
  virulence_high: boolean;
  metastasis_high: boolean;
  model_cindex: number;
  endpoint: string;
  note: string;
}

interface ModelInfo {
  model: string;
  endpoint: string;
  cv_cindex: number;
  n_train: number;
  virulence_features: string[];
  metastasis_features: string[];
  disclaimer: string;
}

const CATEGORY_TO_RISK: Record<GenomicsRiskResult["risk_category"], RiskLevel> = {
  LOW: "low",
  MODERATE: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};

const DEFAULT_FEATURES: Record<string, number> = {
  integration_any: 1,
  integration_hiconf: 1,
  e6_ratio: 0.6,
  is_hpv16: 0,
  is_hpv18: 1,
  is_hr_hpv: 1,
  apobec_tcw_fraction: 0.4,
  a3g_ct_fraction: 0.1,
  APOBEC3G_expr: 7.5,
  APOBEC3B_expr: 5.0,
  SBS2: 200,
  SBS13: 150,
};

const FEATURE_LABELS: Record<string, string> = {
  integration_any: "HPV integration detected",
  integration_hiconf: "High-confidence integration",
  e6_ratio: "E6 splice ratio",
  is_hpv16: "HPV16",
  is_hpv18: "HPV18",
  is_hr_hpv: "High-risk HPV type",
  apobec_tcw_fraction: "APOBEC TCW fraction",
  a3g_ct_fraction: "A3G C>T fraction",
  APOBEC3G_expr: "APOBEC3G expression",
  APOBEC3B_expr: "APOBEC3B expression",
  SBS2: "SBS2 signature weight",
  SBS13: "SBS13 signature weight",
};

const BOOLEAN_FEATURES = new Set([
  "integration_any",
  "integration_hiconf",
  "is_hpv16",
  "is_hpv18",
  "is_hr_hpv",
]);

export default function GenomicsRiskPage() {
  const [features, setFeatures] = useState<Record<string, number>>(DEFAULT_FEATURES);
  const [result, setResult] = useState<GenomicsRiskResult | null>(null);
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInfo = async () => {
    if (info) return;
    try {
      const res = await fetch(`${API_BASE}/risk/info`);
      if (res.ok) setInfo(await res.json());
    } catch {
      // model info is supplementary — safe to ignore fetch failure here
    }
  };

  const compute = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/risk/genomics`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ features }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setResult(await res.json());
      loadInfo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to compute risk");
    } finally {
      setLoading(false);
    }
  };

  const virulenceFields = Object.keys(DEFAULT_FEATURES).filter((f) =>
    ["integration_any", "integration_hiconf", "e6_ratio", "is_hpv16", "is_hpv18", "is_hr_hpv"].includes(f)
  );
  const metastasisFields = Object.keys(DEFAULT_FEATURES).filter(
    (f) => !virulenceFields.includes(f)
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-ink-10 pb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
          Prognostic Diagnostics
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">Genomics Risk</h1>
        <p className="text-sm text-on-surface-variant font-sans mt-2">
          Genomic risk stratification combining HPV integration (virulence) and APOBEC mutational activity (metastasis) into a validated 2-axis risk category.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        {/* Inputs */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <FeatureGroup
            title="Virulence Inputs"
            fields={virulenceFields}
            features={features}
            setFeatures={setFeatures}
          />
          <div className="bg-on-surface text-inverse-on-surface rounded-card p-6">
            <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">
              Metastasis Inputs
            </h2>
            <div className="space-y-4">
              {metastasisFields.map((f) => (
                <FeatureInput
                  key={f}
                  name={f}
                  value={features[f]}
                  onChange={(v) => setFeatures((s) => ({ ...s, [f]: v }))}
                  dark
                />
              ))}
            </div>
            <button
              onClick={compute}
              disabled={loading}
              className="w-full mt-6 py-3 bg-primary text-on-primary rounded-pill font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? "Computing…" : "Compute Risk"}
            </button>
            {error && <p className="mt-3 text-sm text-secondary-fixed-dim">{error}</p>}
          </div>
        </div>

        {/* Result */}
        <div className="md:col-span-8 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-sand rounded-card p-6 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-semibold text-on-surface mb-1">Risk Stratification</h2>
                <p className="text-sm text-on-surface-variant">Virulence × Metastasis</p>
              </div>
              {result && (
                <div>
                  <RiskBadge risk={CATEGORY_TO_RISK[result.risk_category]} />
                </div>
              )}
            </div>

            {result ? (
              <>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <ScoreTile
                    label="Virulence score"
                    value={result.virulence_score}
                    high={result.virulence_high}
                  />
                  <ScoreTile
                    label="Metastasis score"
                    value={result.metastasis_score}
                    high={result.metastasis_high}
                  />
                </div>
                <div className="flex flex-row border-t border-ink-10 pt-6">
                  <Metric label="C-Index" value={result.model_cindex.toFixed(3)} />
                  <div className="w-px bg-ink-10 mx-4" />
                  <Metric label="Endpoint" value={result.endpoint} />
                </div>
                <p className="mt-6 text-xs text-outline">{result.note}</p>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center min-h-[220px] text-on-surface-variant text-sm">
                Enter feature values and compute a risk category.
              </div>
            )}
          </div>

          {info && (
            <div className="bg-surface-container-lowest border border-sand rounded-card p-6">
              <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-widest mb-3">
                Model
              </h3>
              <p className="text-sm text-on-surface-variant mb-2">
                {info.model} · trained on {info.n_train} patients · CV C-index{" "}
                {info.cv_cindex.toFixed(3)}
              </p>
              <p className="text-xs text-outline">{info.disclaimer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FeatureGroup({
  title,
  fields,
  features,
  setFeatures,
}: {
  title: string;
  fields: string[];
  features: Record<string, number>;
  setFeatures: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}) {
  return (
    <div className="bg-surface-container-lowest border border-sand rounded-card p-6">
      <h2 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-4">
        {title}
      </h2>
      <div className="space-y-4">
        {fields.map((f) => (
          <FeatureInput
            key={f}
            name={f}
            value={features[f]}
            onChange={(v) => setFeatures((s) => ({ ...s, [f]: v }))}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureInput({
  name,
  value,
  onChange,
  dark,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
  dark?: boolean;
}) {
  const label = FEATURE_LABELS[name] ?? name;
  const labelClass = dark ? "text-on-surface-variant" : "text-outline";

  if (BOOLEAN_FEATURES.has(name)) {
    return (
      <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className={`text-sm ${dark ? "text-inverse-on-surface" : "text-on-surface"}`}>{label}</span>
        <input
          type="checkbox"
          checked={value === 1}
          onChange={(e) => onChange(e.target.checked ? 1 : 0)}
          className="w-5 h-5 accent-primary rounded"
        />
      </label>
    );
  }

  return (
    <div>
      <label className={`block text-xs mb-1 ${labelClass}`}>{label}</label>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent border-0 border-b border-sand text-sm py-1 focus:outline-none focus:border-primary"
      />
    </div>
  );
}

function ScoreTile({ label, value, high }: { label: string; value: number; high: boolean }) {
  return (
    <div className="bg-surface-container rounded-xl p-4">
      <p className="text-xs text-outline uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${high ? "text-error" : "text-primary"}`}>
        {value.toFixed(3)}
      </p>
      <p className="text-xs text-on-surface-variant mt-1">{high ? "High" : "Low"} (vs. cohort median)</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1">
      <span className="block text-xs text-outline uppercase tracking-widest mb-1">{label}</span>
      <span className="text-2xl font-semibold text-on-surface">{value}</span>
    </div>
  );
}
