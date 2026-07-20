"""
CervicalLens — unified inference wrapper (deployment).
======================================================
One class that loads BOTH trained models and exposes clean predict methods for
the platform API:

  * predict_cytology(image)  -> Pap-smear screening  (NILM vs Abnormal)  [imaging ONNX]
  * predict_genomics(feats)  -> 2D risk category      (LOW..CRITICAL)     [genomics Cox pkl]

Artifacts (produced by research/ml and research/genomics):
  models/imaging/cervicallens_edge.onnx(.data)   + imaging_metrics.json
  models/genomics/combined_risk_real.pkl         + genomics_metrics.json

Usage:
  from models.inference import CervicalLens
  cl = CervicalLens()
  cl.predict_cytology("slide.png")
  cl.predict_genomics({"integration_any": 1, "APOBEC3G_expr": 6.7, ...})
"""
from __future__ import annotations
from pathlib import Path
import json
from typing import Any

import numpy as np

HERE = Path(__file__).parent
IMG_DIR = HERE / "imaging"
GEN_DIR = HERE / "genomics"


class CervicalLens:
    def __init__(self, img_dir: Path = IMG_DIR, gen_dir: Path = GEN_DIR):
        self._img_dir = img_dir
        self._gen_dir = gen_dir
        self._onnx = None          # lazy
        self._img_meta = json.loads((img_dir / "imaging_metrics.json").read_text())
        import joblib
        self._gen = joblib.load(gen_dir / "combined_risk_real.pkl")
        self._gen_meta = json.loads((gen_dir / "genomics_metrics.json").read_text())

    # ── Imaging: cervical cytology screening ────────────────────────────────
    def _session(self):
        if self._onnx is None:
            import onnxruntime as ort
            self._onnx = ort.InferenceSession(
                str(self._img_dir / "cervicallens_edge.onnx"),
                providers=["CPUExecutionProvider"],
            )
        return self._onnx

    def _preprocess(self, image) -> np.ndarray:
        from PIL import Image
        img = image if hasattr(image, "convert") else Image.open(image)
        img = img.convert("RGB").resize((224, 224))
        x = np.asarray(img, dtype=np.float32) / 255.0
        mean = np.array(self._img_meta["input_normalization"]["mean"], dtype=np.float32)
        std = np.array(self._img_meta["input_normalization"]["std"], dtype=np.float32)
        x = (x - mean) / std
        return x.transpose(2, 0, 1)[None]  # (1,3,224,224)

    def predict_cytology(self, image) -> dict[str, Any]:
        """image: path / file-like / PIL.Image -> screening result."""
        sess = self._session()
        logits = sess.run(None, {sess.get_inputs()[0].name: self._preprocess(image)})[0][0]
        e = np.exp(logits - logits.max())
        probs = e / e.sum()
        classes = self._img_meta["class_names"]  # ["NILM", "Abnormal"]
        idx = int(np.argmax(probs))
        return {
            "label": classes[idx],
            "abnormal_probability": round(float(probs[classes.index("Abnormal")]), 4),
            "probabilities": {c: round(float(p), 4) for c, p in zip(classes, probs)},
            "model": "cervicallens_edge (MobileNetV3-Small, distilled)",
        }

    # ── Genomics: 2D prognostic risk ────────────────────────────────────────
    def _axis_score(self, axis: str, row) -> float:
        import pandas as pd
        m = self._gen[axis]
        X = pd.DataFrame([{f: row.get(f, np.nan) for f in m["features"]}])
        Xi = m["imputer"].transform(X.astype(float))
        Xs = pd.DataFrame(m["scaler"].transform(Xi), columns=m["features"])
        return float(np.asarray(m["cph"].predict_partial_hazard(Xs)).ravel()[0])

    def predict_genomics(self, features: dict[str, float]) -> dict[str, Any]:
        """features: dict of any of the genomic feature names -> risk result."""
        vir = self._axis_score("virulence", features)
        met = self._axis_score("metastasis", features)
        thr = self._gen["thresholds"]
        hv, hm = vir >= thr["virulence_median"], met >= thr["metastasis_median"]
        category = ("CRITICAL" if (hv and hm) else "HIGH" if hv
                    else "MODERATE" if hm else "LOW")
        return {
            "risk_category": category,
            "virulence_score": round(vir, 4),
            "metastasis_score": round(met, 4),
            "virulence_high": bool(hv),
            "metastasis_high": bool(hm),
            "model_cindex": round(float(self._gen_meta["cv_cindex_combined"]), 3),
            "endpoint": self._gen_meta["endpoint"],
            "note": "Prognostic risk (cross-validated C-index "
                    f"{self._gen_meta['cv_cindex_combined']:.2f}); research use only.",
        }


if __name__ == "__main__":
    cl = CervicalLens()
    print("Loaded models. Genomics features:",
          cl._gen["combined"]["features"])
    # smoke-test genomics on a high-risk-looking patient
    demo = {"integration_any": 1, "integration_hiconf": 1, "is_hpv18": 1, "is_hr_hpv": 1,
            "e6_ratio": 0.6, "APOBEC3G_expr": 7.5, "APOBEC3B_expr": 5.0,
            "apobec_tcw_fraction": 0.4, "a3g_ct_fraction": 0.1, "SBS2": 200, "SBS13": 150}
    print("Genomics demo:", json.dumps(cl.predict_genomics(demo), indent=2))
