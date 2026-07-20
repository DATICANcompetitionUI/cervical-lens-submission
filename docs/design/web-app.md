# CervicalLens — Web App Design Spec (Clinician & Pathologist Console)

> Blueprint for the `platform/apps/web` product mockups. Built on the **real**
> CervicalLens design system already in the repo — reuse these tokens/components,
> do not invent new ones.

---

## 1. What it is

A desktop-first **web console** for the people who read and act on results:
**pathologists** (review flagged cytology), **clinicians** (manage patients &
decisions), and **program coordinators / lab admins** (campaigns, analytics).

It is the "brain-and-oversight" surface. The **mobile app** does field capture &
screening; the web app does **review, prognosis, and program management**. They
share one backend (`apps/api`, Hono) and one database.

The console wraps the two AI models:
- **Imaging** (cytology screening, NILM vs Abnormal) — surfaced on Slides & Review.
- **Genomics** (2-axis prognostic risk, LOW→CRITICAL) — surfaced on Patients & a
  dedicated Genomics Risk screen, served by `POST /api/v1/risk/genomics`.

---

## 2. Design language (use the real tokens)

| Token | Value | Use |
|---|---|---|
| `--color-primary` | **#12e2b0** teal | primary actions, active nav, focus ring |
| `--color-secondary` | #72dd95 green | positive/low-risk, success |
| `--color-accent` | #7012e2 purple | high/critical risk, emphasis |
| `--color-destructive` | #925f52 | destructive/medium-risk warnings |
| `--color-sidebar` | #000000 | left nav (white text, teal active) |
| background / foreground | #fff / #000 | canvas / text |
| grays | stone/faint/subtle/mid/dark | borders, secondary text |

- **Type:** `NationalPark-Variable` everywhere (body & headings); optional
  `Playfair Display` for large marketing/report titles only.
- **Radius:** cards & buttons **8px**; pills full-round.
- **Shadow:** `--shadow-subtle` only — this is a calm, clinical, low-chrome UI.
- **Tone:** precise, trustworthy, unhurried. Whitespace over decoration. Medical,
  not flashy.
- **Reusable components** (`@cervical-lens/ui`): `Card`, `Button`, `Input`,
  `Avatar`, `Badge`, `StatCard`, `Skeleton`, `RiskBadge`, `StatusBadge`.
- **Risk taxonomy** (`RiskLevel`): low=green, medium=brown, high=purple,
  critical=solid purple. Genomics `MODERATE` → maps to `medium`.
- **Slide status** (`SlideStatus`): pending_inference · inference_complete ·
  flagged_for_review · under_review · review_complete · archived.
- **Accessibility:** WCAG AA contrast, keyboard nav, focus rings (teal), all
  status/risk conveyed by **label + color** (never color alone). Dark mode: sidebar
  is already dark; add a dark canvas variant later.

---

## 3. Information architecture

Left **sidebar** (black, existing) — extend the 4 current items to 8:

```
CervicalLens ▸ Clinical Console
────────────────────────────────
◱  Dashboard            /dashboard
✓  Review Queue         /review-queue        ← pathologist worklist
▤  Slides               /slides              ← all cytology images
⧉  Patients             /patients
🧬 Genomics Risk        /genomics            ← NEW (risk model UI)
📣 Campaigns            /campaigns           ← NEW (screening programs)
📈 Analytics            /analytics           ← NEW (reporting)
⚙  Settings             /settings            ← NEW
────────────────────────────────
[avatar] Dr. Name · role
```

Top bar (per page): breadcrumb/title · global search · notifications bell ·
quick "＋ New" (patient / upload slide).

---

## 4. Screens

### 4.1 Auth — `/(auth)/login`, `/register` (exist)
Split layout. **Left:** black brand panel — teal shield logo, "CervicalLens",
tagline *"AI cervical screening for everyone, everywhere."*, one trust stat
(e.g. "0.96 sensitivity, 0.28 MB edge model"). **Right:** form card (email,
password, role select on register: Pathologist / Clinician / Coordinator).
States: idle, submitting (button spinner), error (inline red), success → redirect.

### 4.2 Dashboard — `/dashboard`
The at-a-glance program pulse.

```
┌ Dashboard ────────────────────────────────  [＋ New]  🔔  🔍 ┐
│ ┌StatCard┐ ┌StatCard┐ ┌StatCard┐ ┌StatCard┐ ┌StatCard┐        │
│ │Screened│ │Pending │ │ Needs  │ │ High-  │ │Patients│        │
│ │ today  │ │  AI    │ │ review │ │ risk   │ │        │        │
│ │  128   │ │  14    │ │   9    │ │   6    │ │ 1,204  │        │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
│ ┌ Screening throughput (14d line) ┐ ┌ Risk distribution ┐    │
│ │  ▁▂▃▅▇▆▅▃  area chart            │ │ donut LOW..CRIT   │    │
│ └─────────────────────────────────┘ └───────────────────┘    │
│ ┌ Review queue preview (top 5) ────────────────────────────┐ │
│ │ ▤ thumb · Patient · StatusBadge · RiskBadge · 2m ago  →  │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌ Recent activity feed ────────────────────────────────────┐ │
└──────────────────────────────────────────────────────────────┘
```
**Fill from:** `/slides/stats`, `/reviews`, `/patients`, `/campaigns`.
StatCards use `StatCard`; charts follow the dataviz palette (teal primary).
Empty state: "No screenings yet — invite a field worker or upload a slide."

### 4.3 Slides — `/slides`
All cytology images. Toggle grid/table.

```
Filters: [Status ▾][Risk ▾][Campaign ▾][Date ▾]   [⬆ Upload slide]
┌ card ┐ ┌ card ┐ ┌ card ┐ ┌ card ┐
│▤thumb│ │▤thumb│ ...   each: thumbnail, patient name, StatusBadge,
│Amina │ │Grace │       AI result (NILM/Abnormal + %), RiskBadge, date
│Abn 92%│ │NILM  │
└──────┘ └──────┘
```
**Fill from:** `GET /slides` (+ filters). Row/card → `/slides/[id]`.
Upload → `POST /slides/upload` → creates `pending_inference` → runs imaging model.

### 4.4 Slide detail — `/slides/[id]` (exists)
The imaging-inference workspace + pathologist review.

```
┌ ◀ Slides / Amina O. · Slide #A-1042 ───────── StatusBadge ─────┐
│ ┌ Viewer (zoom/pan) ──────────┐ ┌ AI Verdict ────────────────┐│
│ │  [cytology image]           │ │ ● Abnormal    92.4%        ││
│ │  ▢ abnormal-region overlay  │ │ model: cervicallens_edge   ││
│ │  🔍 – +   ⤢ fit             │ │ sens 0.96 · research use   ││
│ └─────────────────────────────┘ ├────────────────────────────┤│
│                                  │ Patient mini-card + link   ││
│                                  │ Genomic risk: RiskBadge →  ││
│                                  ├────────────────────────────┤│
│                                  │ REVIEW                     ││
│                                  │ ( ) Confirm  ( ) Override  ││
│                                  │ [ risk level ▾ ] [note...] ││
│                                  │ [ Submit review ]          ││
│                                  └────────────────────────────┘│
│ ┌ Audit / history: uploaded → AI → assigned → reviewed ───────┐│
└────────────────────────────────────────────────────────────────┘
```
**Fill from:** `GET /slides/:id`, `POST /slides/:id/inference` (imaging), `POST
/reviews`. Genomic risk (if patient has genomics) via `/risk/genomics`.
States: pending_inference (skeleton + "AI processing…"), complete, under_review.

### 4.5 Review Queue — `/review-queue` (exists)
Pathologist worklist, prioritized. Table: priority chip, thumbnail, patient,
AI result, RiskBadge, wait time, campaign. Sort by risk/oldest. Row → slide
detail in **review mode**. Batch: assign to me, archive. Keyboard: `j/k` move,
`c` confirm, `o` override — a fast reading loop.
**Fill from:** `GET /slides?status=flagged_for_review`, `/reviews`.

### 4.6 Patients — `/patients` (exists) + `/patients/[id]`
List: search, filters (risk, campaign, last-screened). Detail:

```
┌ Amina O. · 34 · ID ····  ┐  RiskBadge(high)
│ Demographics | Contact   │
├──────────────────────────┤
│ Screening history (timeline of slides w/ thumbnails + results)
│ ● 2026-07 Abnormal 92% (reviewed)  ● 2025-11 NILM …
├──────────────────────────┤
│ GENOMIC RISK PANEL
│  2D matrix (virulence × metastasis) · category · C-index 0.66
│  [ Run / update risk ]  → /risk/genomics
├──────────────────────────┤
│ Notes · Linked campaign · Documents
└──────────────────────────┘
```
**Fill from:** `/patients/:id`, `/slides?patient=`, `/risk/genomics`.

### 4.7 Genomics Risk — `/genomics` (NEW — the science showcase)
Turns the prognostic model into a screen.

```
┌ Genomics Risk ────────────────────────────────────────────────┐
│ Select patient ▾  OR  enter features manually                  │
│ ┌ Virulence inputs ─────────┐ ┌ Metastasis inputs ───────────┐│
│ │ HPV integration (Y/N)     │ │ APOBEC3G expr    [ 7.5 ]     ││
│ │ high-conf integration     │ │ APOBEC3B expr    [ 5.0 ]     ││
│ │ E6 splice ratio  [0.6]    │ │ APOBEC TCW frac  [0.4]       ││
│ │ HPV type  ▾ HPV18         │ │ A3G C>T frac     [0.1]       ││
│ └───────────────────────────┘ │ SBS2 [200] SBS13 [150]      ││
│                                └──────────────────────────────┘│
│ [ Compute risk ] → POST /api/v1/risk/genomics                  │
│ ┌ RESULT ──────────────────────────────────────────────────┐  │
│ │  RiskBadge: CRITICAL                                       │  │
│ │  2D scatter: virulence↑ × metastasis↑ (quadrant plot)     │  │
│ │  Kaplan-Meier curve for the category                      │  │
│ │  "Cross-validated C-index 0.66 · research use only"       │  │
│ └───────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```
**Fill from:** `POST /risk/genomics` (live), `GET /risk/info` (feature list +
metrics + disclaimer). Use the exported `real_2d_risk_matrix.png` /
`real_km_by_risk.png` as the visual reference for the plots.

### 4.8 Campaigns — `/campaigns` (NEW)
Screening programs (community drives). List (name, region, dates, coverage %,
screened, high-risk found). Detail: KPIs, coverage map, worker roster, slide
funnel (captured → AI → reviewed → referred). Create/edit campaign; assign field
workers (who use the mobile app). **Fill from:** `GET /campaigns`.

### 4.9 Analytics — `/analytics` (NEW)
Program reporting. Cards + charts: screening volume over time, positivity rate,
model performance (sensitivity 0.96 / specificity note), turnaround time
(capture→review), risk distribution, campaign comparison, geographic heatmap.
Export CSV/PDF. Follow dataviz rules (one system, teal primary, accessible).

### 4.10 Settings — `/settings` (NEW)
Tabs: **Profile** (name, avatar, role), **Organization** (name, sites),
**Team/Roles** (invite, RBAC), **Notifications** (email/push prefs),
**Models** (read-only cards: imaging v1 — acc 0.85/sens 0.96/AUC 0.84/0.28 MB;
genomics v1 — C-index 0.66/HR 2.2; versions + "research use only"),
**Integrations** (API keys, webhook to lab systems).

---

## 5. How the screens connect

```
login → dashboard ─┬─▶ review-queue ─▶ slides/[id] (review) ─▶ patient
                   ├─▶ slides ────────▶ slides/[id]
                   ├─▶ patients ──────▶ patients/[id] ─▶ genomics (risk)
                   ├─▶ genomics (standalone risk calc)
                   ├─▶ campaigns ─────▶ campaign/[id] (roster, funnel)
                   ├─▶ analytics
                   └─▶ settings
```
The **slide → review → patient → genomics** chain is the core clinical loop;
**campaigns → analytics** is the program-management loop.

---

## 6. What to fill every page with (data map)

| Page | API / source | Sample content |
|---|---|---|
| Dashboard | `/slides/stats`, `/reviews`, `/patients` | 128 screened, 9 to review, 6 high-risk |
| Slides | `/slides` | Amina O. — Abnormal 92% — Needs Review |
| Slide detail | `/slides/:id`, imaging model | verdict, %, region overlay, audit trail |
| Review Queue | `/slides?status=flagged_for_review` | prioritized worklist |
| Patients | `/patients`, `/risk/genomics` | demographics, history, 2D risk |
| Genomics | `/risk/genomics`, `/risk/info` | CRITICAL, C-index 0.66 |
| Campaigns | `/campaigns` | "Ibadan North Drive — 62% coverage" |
| Analytics | aggregate | positivity 7%, TAT 2.1 days |
| Settings | user/org, model metrics | model cards |

Every page needs **empty**, **loading (Skeleton)**, and **error** states — the
scaffold already ships `Skeleton`.

---

## 7. Cross-app relationship (see mobile spec)
Field worker (mobile) **captures + screens** → slide lands in web **Review
Queue** → pathologist confirms/overrides → result + follow-up **pushed back** to
the worker's phone (notifications/device-tokens). Web adds the **genomics
prognosis** the phone can't compute. One backend, two surfaces, one patient record.
