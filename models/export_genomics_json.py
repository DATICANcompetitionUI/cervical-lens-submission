"""
Export the genomics Cox risk model to a portable JSON the TypeScript backend can
score with zero Python at runtime.

A Cox model score is just a linear predictor + exp:
    z_f   = (impute(x_f) - mean_f) / scale_f      # median-impute then standardize
    lp    = sum_f  coef_f * z_f                    # log partial hazard
Risk category uses the cohort median of lp on each axis (recomputed here so the
JS thresholds match exactly; exp() is monotonic so log-space split == hazard split).

Output: models/genomics/risk_model.json  (+ copy into the platform)
Run: uv run python models/export_genomics_json.py   (from research/genomics venv)
"""
from pathlib import Path
import json
import warnings

import numpy as np
import pandas as pd
import joblib

warnings.filterwarnings("ignore")

HERE = Path(__file__).parent
GEN = HERE / "genomics"
RESEARCH = HERE.parent / "research/genomics"
PROC = RESEARCH / "data/processed"
HR_HPV = {"HPV16", "HPV18", "HPV31", "HPV33", "HPV35", "HPV45", "HPV52", "HPV58"}


def cohort():
    """Rebuild the analysis cohort exactly as notebook 10 does."""
    m = pd.read_csv(PROC / "master_patient_table.csv")
    ig = pd.read_csv(PROC / "integration_features.csv")
    df = m.merge(ig, on="patient_barcode", how="left")
    df["integration_any"] = df["integration_any"].fillna(0).astype(float)
    df["integration_hiconf"] = df["integration_hiconf"].fillna(0).astype(float)
    df["e6_ratio"] = pd.to_numeric(df["e6_ratio"], errors="coerce")
    ht = df["hpv_type_consensus"].astype(str)
    df["is_hpv16"] = (ht == "HPV16").astype(float)
    df["is_hpv18"] = (ht == "HPV18").astype(float)
    df["is_hr_hpv"] = ht.isin(HR_HPV).astype(float)
    df = df.dropna(subset=["PFI", "PFI.time"])
    df = df[df["PFI.time"] > 0]
    return df


def axis_json(axis, df):
    feats = axis["features"]
    med = dict(zip(feats, axis["imputer"].statistics_.tolist()))
    mean = dict(zip(feats, axis["scaler"].mean_.tolist()))
    scale = dict(zip(feats, axis["scaler"].scale_.tolist()))
    coef = {f: float(axis["cph"].params_[f]) for f in feats}

    # linear predictor over the cohort -> threshold = median
    lp = np.zeros(len(df))
    for f in feats:
        x = pd.to_numeric(df[f], errors="coerce").to_numpy(dtype=float)
        x = np.where(np.isnan(x), med[f], x)
        z = (x - mean[f]) / scale[f]
        lp += coef[f] * z
    return {
        "features": feats,
        "median": med,
        "mean": mean,
        "scale": scale,
        "coef": coef,
        "threshold": float(np.median(lp)),
    }


def main():
    bundle = joblib.load(GEN / "combined_risk_real.pkl")
    meta = json.loads((GEN / "genomics_metrics.json").read_text())
    df = cohort()

    out = {
        "model": "cervicallens_genomics_risk_v1",
        "endpoint": bundle["endpoint"],
        "cv_cindex": round(float(bundle["cv_cindex_combined"]), 3),
        "n_train": int(len(df)),
        "axes": {
            "virulence": axis_json(bundle["virulence"], df),
            "metastasis": axis_json(bundle["metastasis"], df),
        },
        "categories": {
            "CRITICAL": "high virulence AND high metastasis",
            "HIGH": "high virulence only",
            "MODERATE": "high metastasis only",
            "LOW": "low on both",
        },
        "disclaimer": "Prognostic research model on TCGA-CESC. Not a clinical device.",
    }

    dest = GEN / "risk_model.json"
    dest.write_text(json.dumps(out, indent=2))
    print(f"wrote {dest}")

    # copy into the platform so the TS backend bundles it
    plat = HERE.parent / "platform/apps/api/src/ml"
    plat.mkdir(parents=True, exist_ok=True)
    (plat / "genomics_risk_model.json").write_text(json.dumps(out, indent=2))
    print(f"wrote {plat/'genomics_risk_model.json'}")

    # quick sanity: score one high-risk patient
    def score(axis, feats_in):
        a = out["axes"][axis]
        lp = sum(a["coef"][f] * ((feats_in.get(f, a["median"][f]) - a["mean"][f]) / a["scale"][f])
                 for f in a["features"])
        return lp, lp >= a["threshold"]
    demo = {"integration_any": 1, "integration_hiconf": 1, "is_hpv18": 1, "is_hr_hpv": 1,
            "e6_ratio": 0.6, "APOBEC3G_expr": 7.5, "APOBEC3B_expr": 5.0,
            "apobec_tcw_fraction": 0.4, "a3g_ct_fraction": 0.1, "SBS2": 200, "SBS13": 150}
    v_lp, v_hi = score("virulence", demo)
    m_lp, m_hi = score("metastasis", demo)
    cat = ("CRITICAL" if v_hi and m_hi else "HIGH" if v_hi else "MODERATE" if m_hi else "LOW")
    print(f"sanity demo -> vir_lp={v_lp:.3f}(hi={v_hi}) met_lp={m_lp:.3f}(hi={m_hi}) => {cat}")


if __name__ == "__main__":
    main()
