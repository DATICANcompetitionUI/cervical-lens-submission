# CervicalLens — Mobile App Design Spec (Field Screening App)

> Blueprint for `platform/apps/mobile` (currently a bare Expo scaffold). Uses the
> **same** CervicalLens design system as the web console — same palette, font,
> risk taxonomy — adapted for touch, camera, and offline field use.

---

## 1. What it is

A **field companion** for **community health workers & field nurses** who screen
women where there are no labs or pathologists — markets, clinics, rural outreach.
It does three things the web console can't: **capture** a Pap-smear/cervical
image, **screen it on-device** (the 0.28 MB edge model runs offline in ~4 ms),
and **register patients** on the spot. Results sync to the backend; a pathologist
reviews on web; the verdict is **pushed back** to the worker's phone.

Design constraints that drive everything:
- **Offline-first** — connectivity is unreliable; everything works offline and
  syncs later.
- **Low-end Android** — light, fast, small footprint.
- **One-handed, in-the-field** — big tap targets, minimal typing, camera-forward.
- **Multilingual & low-literacy friendly** — icons + short labels, English +
  local languages (e.g. Yoruba, Hausa, Igbo).

---

## 2. Design language (shared tokens, mobile-tuned)

Same tokens as web (`#12e2b0` teal primary, `#72dd95` green, `#7012e2` purple,
`#925f52` brown, NationalPark font, 8px radius). Mobile adjustments:

- **Bottom tab bar** (black `--color-sidebar`, teal active) — thumb-reachable.
- **Large primary button** (teal, full-width, 8px radius, ≥48dp tall).
- **Result screens are color-flooded** — a NILM result is a calm green screen; an
  Abnormal result is a purple alert screen — instantly readable at a glance.
- **RiskBadge / StatusBadge** reused (same semantics, larger).
- Generous spacing, 16–17px min body text, high contrast, haptics on capture &
  result.
- Every destructive/irreversible action confirmed; every network action shows an
  offline-queued state.

---

## 3. Navigation

Bottom tab bar with a center capture FAB:

```
┌──────────────────────────────────────────────┐
│                (screen content)               │
│                                               │
├──────────────────────────────────────────────┤
│  🏠 Home   👥 Patients  ⦿  🔄 Sync   👤 Me    │
│                    ▲ Capture (teal FAB)        │
└──────────────────────────────────────────────┘
```
Tabs: **Home · Patients · Capture (FAB) · Sync · Me**. Notifications via bell in
the Home header.

---

## 4. Screens

### 4.1 Onboarding / Login
Black splash, teal shield logo, tagline. Login (phone/email + PIN). "Works
offline" reassurance. First-run: language picker + a 3-card explainer
(Register → Capture → Sync). Biometric/PIN unlock for returning users.

### 4.2 Home
```
┌ Good morning, Amara 👋            🔔(2) ┐
│ ┌ Sync status: 3 pending ⟳ ─────────────┐│
│ ┌ today ┐ ┌ pending ┐ ┌ flagged ┐        │
│ │  12   │ │   3     │ │   1     │        │
│ │screened│ │ to sync │ │ review  │        │
│ └───────┘ └─────────┘ └─────────┘        │
│ ┌ [＋ New screening]  (big teal) ────────┐│
│ ┌ [＋ Register patient]  (outline) ──────┐│
│ ┌ Recent screenings ─────────────────────┐│
│ │ ▤ Grace A. · NILM · synced             ││
│ │ ▤ Joy E.  · Abnormal · needs review 🟣 ││
│ └────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```
**Fill from:** local DB + `/slides/stats`. Sync banner reflects offline queue.

### 4.3 Capture / Scan  (the core action)
Camera-first. Frame guide overlay for the slide/specimen, torch toggle,
capture button, or "import from gallery / microscope cam".
```
┌ ◀  New screening ───────────────────┐
│ ┌ patient: Grace A. (or ＋ select) ┐ │
│ ┌────────── camera ──────────────┐   │
│ │  ▢ align specimen in frame     │   │
│ │        (guide overlay)         │   │
│ └────────────────────────────────┘   │
│  🔦 torch      ( ◉ capture )   🖼 lib │
└──────────────────────────────────────┘
   → preview → [Use photo] → runs edge model → Result
```
On-device ONNX inference; if the model can't run, queue for cloud inference on
sync. **Fill from:** imaging model (`cervicallens_edge`).

### 4.4 Screening Result
Color-flooded, unambiguous.
```
NILM (green screen)             Abnormal (purple screen)
┌───────────────────┐           ┌───────────────────┐
│      ✓            │           │      !             │
│   NILM            │           │   ABNORMAL         │
│ Negative          │           │ 92% confidence     │
│                   │           │                    │
│ Next: routine     │           │ Next: refer for    │
│ re-screen in 3y   │           │ pathologist review │
│                   │           │                    │
│ [Save & queue]    │           │ [Save & flag] 🟣   │
│ [Re-capture]      │           │ [Add note]         │
└───────────────────┘           └───────────────────┘
```
Saves a slide record (status `pending_inference`→`inference_complete`), attaches
to patient, queues for pathologist review if abnormal. Plain-language "next
steps"; optional voice/'"read aloud".

### 4.5 Register Patient
Minimal form: name, age, phone, ID (optional), location (auto GPS + manual),
consent toggle. Big fields, few taps. Creates local record, syncs later.
**Fill from:** `/patients` (create). Dedup hint if phone/ID matches.

### 4.6 Patients
Search + list (local + synced), each row: avatar, name, age, last result badge,
sync state (✓ synced / ⟳ pending). Detail: demographics, screening history
timeline, results, "New screening" shortcut. **Fill from:** `/patients`, local DB.

### 4.7 Sync / Offline Queue
The trust screen for spotty networks.
```
┌ Sync ─────────────────────────────┐
│ ● Online · last synced 5m ago      │
│ Pending: 3 slides, 1 patient       │
│ ┌ Grace A. slide ······· ⟳ upload ┐│
│ ┌ New patient: Joy E. ··· ⟳       ┐│
│ [ Sync now ]  (teal)               │
│ Conflicts: 0                       │
└────────────────────────────────────┘
```
Manual + auto sync, per-item status, conflict resolution, connectivity indicator.

### 4.8 Notifications
Closes the loop: "Dr. Okoro reviewed Joy E. → confirmed Abnormal → refer to
clinic." Campaign assignments ("You're added to Ibadan North Drive"). Push via
`device-tokens`/`notifications` API. Tap → patient/result.

### 4.9 Me / Profile
Worker info, assigned campaign, stats (screened this week), **language**,
offline/data settings, model version + "research use only", logout.

---

## 5. How the screens connect (field flow)

```
login → home ─┬─▶ ＋Register patient ─┐
              │                        ▼
              └─▶ ＋New screening → Capture → Result → Save
                                                   │
                                            (offline queue)
                                                   ▼
                                                 Sync ──▶ backend
                                                            │
                    (pathologist reviews on WEB) ◀──────────┘
                                                   │
                              Notification pushed back to phone
                                                   ▼
                                     Patient detail · follow-up
```

Primary loop: **Register → Capture → Result → Sync**. Everything is reachable in
≤2 taps from Home.

---

## 6. What to fill every screen with (data map)

| Screen | Source | Sample content |
|---|---|---|
| Home | local DB + `/slides/stats` | 12 screened, 3 to sync, 1 flagged |
| Capture | imaging model | live camera + edge inference |
| Result | imaging model | "Abnormal · 92% · refer" |
| Register | `/patients` (create) | Grace A., 29, Ibadan |
| Patients | `/patients` + local | list w/ sync badges |
| Sync | offline queue | 3 pending uploads |
| Notifications | `/notifications` | "Review complete: refer Joy E." |
| Me | user + campaign | "Amara · Ibadan North Drive" |

States for every screen: **offline**, **syncing**, **empty**, **error**, plus
capture-specific **blurry/retake** guidance.

---

## 7. Relationship to the web console

| | Mobile (field) | Web (console) |
|---|---|---|
| Users | health workers, field nurses | pathologists, clinicians, coordinators |
| Does | capture · edge-screen · register · sync | review · genomic prognosis · campaigns · analytics |
| Model | imaging (offline ONNX) | imaging review + **genomics risk** |
| Network | offline-first | always-on |

One backend (`apps/api`), one patient record, one design language. The phone is
the **sensor + first read**; the web is the **expert read + program brain**;
notifications keep them in sync.
