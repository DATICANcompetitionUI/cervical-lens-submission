<div align="center">

# 🔬 CervicalLens

**AI cervical cancer screening & prognosis — built for low-resource settings.**

Cytology screening at the edge · genomic risk stratification · a real web/mobile/API product.

`TypeScript` · `Bun` · `Turborepo` · `Next.js` · `Python` · `ONNX` · `PyTorch` · `lifelines`

> 🔗 **Live API:** [api-cervicallens.hallelx2.com/health](https://api-cervicallens.hallelx2.com/health) &nbsp;·&nbsp; ⚠️ Research use only — not a clinical device.

</div>

---

## 1. The Clinical Problem & Our Approach

Cervical cancer is one of the most highly preventable cancers when caught early, yet it remains one of the leading causes of cancer-related mortality among women in sub-Saharan Africa. The barrier to effective screening is not medical knowledge; it is **access**: a shortage of trained pathologists, sparse laboratory infrastructure, and a lack of computation at the point of care.

CervicalLens addresses these challenges on two main fronts:
1. **Primary screening at the edge**: A tiny, distilled computer vision model classifies Pap-smear cytology cell images offline on low-end mobile devices in **3.6 ms** ($96.0\%$ sensitivity).
2. **Prognostic risk stratification**: A 2-axis survival-risk model scores confirmed cervical cancer patients based on viral and host molecular features, classifying them into a **LOW** to **CRITICAL** risk matrix.
3. **End-to-End Platform**: A modern, unified clinical portal and offline-first mobile app that connects community workers, pathologists, and clinicians.

---

## 2. Validated Scientific Results (Real Data Only)

Every model and metric reported in this project is validated on **real-world clinical cohorts** using out-of-fold or held-out test sets. There is no synthetic fallback.

| Model | Metric | Value | Reference / Footprint |
|---|---|---|---|
| **Imaging** (Cytology) | Accuracy | **85.0%** | Held-out test set |
| | **Sensitivity** | **96.0%** | High-sensitivity screening filter |
| | Specificity | **40.0%** | Confirmatory pathologist queue triage |
| | AUC-ROC | **0.84** | Area Under the ROC Curve |
| | Edge Footprint | **0.28 MB** | ONNX binary size |
| | CPU Latency | **3.6 ms** | Runs on-device offline (vs 14.4 ms PyTorch) |
| **Genomics** (Prognosis) | Combined C-Index | **0.655** | 5-fold cross-validated out-of-fold C-index |
| | Combined 95% CI | **[0.588, 0.713]** | Bootstrap confidence interval |
| | Hazard Ratio (HR) | **2.2** | CRITICAL vs LOW risk category ($p = 0.010$) |

---

## 3. The Genomics Prognosis Pipeline (`research/genomics`)

The genomics module builds a **two-axis survival prognostic model** using real **TCGA-CESC** patient data to predict Progression-Free Interval (PFI).

### 3.1 Data Collection & Sources
* **Expression & Clinical endpoints**: STAR-TPM gene expression values and clinical files sourced from **UCSC Xena** (TCGA-CESC cohort).
* **Mutational Signatures**: Somatic mutation MAF files sourced from the **GDC Portal**.
* **HPV Genotype & Integration**: HPV consensus genotypes, E6/E7 splice ratios, and integration events parsed from Supplementary Table 3 of the TCGA-CESC landmark publication (*Nature* 2017).

### 3.2 Axis Specifications
* **Virulence Axis** ($C\text{-index} = 0.591$): Captures oncogenic drive via HPV genotype and genomic integration. Features include `integration_any`, `integration_hiconf`, `e6_ratio`, `is_hpv16`, `is_hpv18`, and `is_hr_hpv`.
* **Metastasis Axis** ($C\text{-index} = 0.645$): Captures somatic mutational instability driven by host antiviral defenses. Features include `apobec_tcw_fraction`, `a3g_ct_fraction`, `APOBEC3G_expr`, `APOBEC3B_expr`, `SBS2`, and `SBS13`.

### 3.3 The 2D Risk Matrix
Axis hazard scores are computed using regularized Cox Proportional Hazards models. Patients are categorized based on their risk score relative to the cohort medians:
```
                     METASTASIS (APOBEC activity)
                    Low            High
  VIRULENCE  ┌──────────────┬──────────────┐
  (E2 dis.)  │     LOW      │   MODERATE   │  Low
             ├──────────────┼──────────────┤
             │     HIGH     │   CRITICAL   │  High
             └──────────────┴──────────────┘
```
* **LOW**: Low virulence & low metastasis (associated with standard surveillance).
* **MODERATE**: Low virulence & high metastasis (moderate progression risk).
* **HIGH**: High virulence & low metastasis (high progression risk).
* **CRITICAL**: High virulence & high metastasis (highest progression hazard, HR = 2.2).

### 3.4 Scientific Critical Thinking: The APOBEC3B Survival Contradiction
A published study (PMC10076974) claimed that high expression of the APOBEC3B enzyme led to *worse* overall survival using a simple median-split univariate log-rank test. Our pipeline conducted robust sensitivity checks and **disproved** this claim:
1. **Multivariate Cox Check**: Adding adjustments for FIGO stage and age (which they omitted) reveals high APOBEC3B is significantly **protective** (better survival), hazard ratio **0.66–0.72** ($p = 0.0008\text{--}0.002$).
2. **Cutpoint Scan**: A complete scan of expression quantiles from 10% to 90% failed to produce *a single cutpoint* where high expression statistically predicted worse survival.
3. **Group Label Inversion**: Flipping the high/low group labels reproduced their published KM curves and log-rank statistics exactly. This demonstrates that the published study suffers from a **label inversion bug** (a coding mistake where they swapped the low and high groups in their data analysis).

---

## 4. Cytology Imaging Pipeline (`research/ml`)

The imaging module screens Pap-smear slide tile images to classify them as Negative (NILM) or Abnormal.

### 4.1 Foundation-Model Distillation
Training a heavy neural network from scratch on small cytology datasets is prone to overfitting. We utilize **Knowledge Distillation** to transfer feature representations from a pathology foundation model (teacher) into an edge-compatible **MobileNetV3-Small** (student):
* **Teachers evaluated**: CTransPath, UNI, and Google Path Foundation. CTransPath and Google Path Foundation achieved the highest linear probe AUC (0.83).
* **Distillation Loss**: Combined Kullback-Leibler (KL) divergence and Cross-Entropy (CE) loss:
  $$\mathcal{L} = \alpha T^2 \mathcal{D}_{\text{KL}}\left(\text{softmax}\left(\frac{\mathbf{z}_s}{T}\right) \;\Big\|\; \text{softmax}\left(\frac{\mathbf{z}_t}{T}\right)\right) + (1-\alpha) \mathcal{L}_{\text{CE}}(\mathbf{y}, \mathbf{z}_s)$$
  with parameters: Temperature $T = 4.0$ and weighting coefficient $\alpha = 0.7$.

The student is exported as a **0.28 MB ONNX** network that runs in **3.6 ms** on CPU, allowing it to execute offline on low-end mobile devices without any Python or PyTorch runtime dependencies.

---

## 5. Platform Architecture (`platform/`)

The platform is designed as a Turborepo monorepo workspace to maximize asset reuse across the Node.js API, clinician web console, and Expo mobile client.

```
platform/
├── apps/
│   ├── api/            # Hono API (Vercel Serverless, Node.js 22)
│   ├── web/            # Next.js Web Console (Clinician & Pathologist portal)
│   └── mobile/         # Expo React Native App (Field worker client)
└── packages/
    ├── config/         # TypeScript config & environment schema
    ├── db/             # Drizzle ORM schema (Neon Serverless Postgres)
    ├── hooks/          # Shared React Query & state hooks
    ├── shared/         # Common TypeScript interfaces & business rules
    └── ui/             # Reusable UI component tokens (NationalPark font)
```

### 5.1 Key Integration Design Choices
* **Pure TypeScript Genomics Predictor**: Because a Cox Proportional Hazards model is a linear combination followed by `exp()`, we exported the trained coefficients, means, and scales to a JSON file (`genomics_risk_model.json`). We re-implemented the inference scorer in **pure TypeScript** inside the Hono API. This runs in **under 1 microsecond** with **zero external dependencies** and is fully portable.
* **Dynamic ONNX Runtime Loading**: Native Node.js modules can cause Vercel serverless containers to crash at startup if they cannot resolve the compiled binary file. The Hono API uses dynamic `createRequire` wrappers to load `onnxruntime-node` inside a try-catch block during the first API invocation. This keeps health check endpoints active even if native libraries fail to load.
* **Serverless Entrypoint Wrap**: We wrapped the Hono entrypoint in `vercel-entry.ts` to dynamically bind `app.fetch` to the request listener:
  ```typescript
  handler = getRequestListener(typeof app === "function" ? app : app.fetch.bind(app));
  ```
  This resolves the transpilation issue where esbuild packages the Hono instance as a plain object, preventing preflight CORS `OPTIONS` crashes.

---

## 6. Quick Start & Execution

### 6.1 Run the TypeScript Platform
Copy `platform/apps/api/.env.example` to `.env` and set `DATABASE_URL` (Neon Postgres) and `BETTER_AUTH_SECRET`.
```bash
cd platform
bun install
bun run dev
```
Apply the database schema using Drizzle:
```bash
cd platform/packages/db
bunx drizzle-kit push
```

### 6.2 Reproduce the Science (Python)
Ensure `uv` is installed on your machine.
```bash
cd research/genomics
uv sync
uv run python notebooks/02_hpv_integration_tcga.py   # Run HPV integration extract
uv run python notebooks/10_combined_risk_real.py      # Run 2-axis risk modeling & CV eval
```

---

## 7. Deployment Status

* **API Backend**: Vercel — [api-cervicallens.hallelx2.com/health](https://api-cervicallens.hallelx2.com/health) (CORS preflight & `/health` resolved).
* **Clinician Web Console**: Vercel — [cervicallens.hallelx2.com](https://cervicallens.hallelx2.com).
* **Mobile Client**: Expo EAS — [Build #5a988e9e-f906-4e95-895d-b786e77f7c83](https://expo.dev/accounts/halleluyaholudele/projects/cervicallens/builds/5a988e9e-f906-4e95-895d-b786e77f7c83).
* **Database**: Neon Serverless Postgres.

---

## 8. Linear Backlog
* **Project**: CervicalLens
* **ID**: `7c50db43-c5a5-4aca-a2d6-6f3ed0b7467a`
* **Repos**: cervical-scancer
