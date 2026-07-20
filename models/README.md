# CervicalLens — Exported Models & Inference Layer

This directory acts as the **bridge between the scientific research pipelines (`research/`) and the product platform (`platform/`)**. It houses the compiled model binaries, validation metadata, and Python-based microservice runtimes.

---

## 1. Directory Structure

```
models/
├── imaging/
│   ├── cervicallens_edge.onnx      # Distilled MobileNetV3-Small student (0.28 MB)
│   ├── cervicallens_edge.onnx.data # ONNX weight binary segment (4.2 MB)
│   └── imaging_metrics.json        # Normalization specs & held-out test metrics
├── genomics/
│   ├── combined_risk_real.pkl      # 2-axis Cox proportional hazards model
│   ├── genomics_metrics.json       # Out-of-fold C-index and hazard statistics
│   └── real_*.png                  # KM curves and 2D risk matrices
├── inference.py                    # Unified CervicalLens class (cytology & genomics)
├── serve.py                        # FastAPI microservice wrapper
└── requirements.txt
```

---

## 2. Model Tasks & Specifications

| Model | Input | Target Task | Output | Validation | Deployed Form |
|---|---|---|---|---|---|
| **Imaging** | $224\times224$ RGB image buffer | Pap-smear cell screening | `NILM` / `Abnormal` + confidence probability | Accuracy: **85.0%**<br>Sensitivity: **96.0%**<br>Specificity: **40.0%** | **`cervicallens_edge.onnx`** run via ONNX Runtime |
| **Genomics** | Patient genetic values (12 features) | Survival risk stratification | `LOW`, `MODERATE`, `HIGH`, `CRITICAL` risk classification | Out-of-fold C-index: **0.655** (95% CI: `[0.588, 0.713]`) | **`genomics_risk_model.json`** coefficients run in pure TypeScript |

---

## 3. Deployment & Platform Integration

### 3.1 Python Microservice (`serve.py`)
To serve the models as a network microservice, run the FastAPI endpoint:
```bash
pip install -r requirements.txt
uvicorn serve:app --port 8000
```
#### Testing Endpoints:
```bash
# Cytology Screening
curl -F image=@smear.png http://localhost:8000/predict/cytology

# Genomics Risk Stratification
curl -X POST http://localhost:8000/predict/genomics \
  -H 'content-type: application/json' \
  -d '{"features": {"integration_any":1,"is_hpv18":1,"APOBEC3G_expr":7.5,"SBS2":200,"SBS13":150}}'
```

### 3.2 TypeScript API Integration (`platform/apps/api`)
The Node.js/Hono production API consumes these models directly at the edge:
1. **Imaging Model**: Executed in Node.js using dynamic `onnxruntime-node` imports. Preprocessing is handled using `jimp` to normalize pixels to matching ImageNet metrics.
2. **Genomics Scorer**: Run via a re-implemented **pure TypeScript** script. Coefficients and standardization parameters are compiled into a static JSON, ensuring zero dependencies and microsecond-level execution times.
