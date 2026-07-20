"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RiskBadge, StatusBadge, Button, Card, Skeleton } from "@cervical-lens/ui";
import type { Slide, Review, CellClassification, ReviewDecision } from "@cervical-lens/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const CLASSIFICATIONS: CellClassification[] = [
  "NILM", "ASC-US", "ASC-H", "LSIL", "HSIL", "SCC", "AGC",
];

const DECISIONS: { value: ReviewDecision; label: string }[] = [
  { value: "agree_with_ai", label: "Agree with AI" },
  { value: "disagree_upgrade", label: "Disagree - Higher Severity" },
  { value: "disagree_downgrade", label: "Disagree - Lower Severity" },
  { value: "inconclusive", label: "Inconclusive - Needs Resample" },
];

export default function SlideDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slideId = Number(params.id);

  const [slide, setSlide] = useState<Slide | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [classification, setClassification] = useState<CellClassification>("NILM");
  const [decision, setDecision] = useState<ReviewDecision>("agree_with_ai");
  // TODO: wire a confidence selector into the review form; submitted as a fixed default for now.
  const [confidence] = useState("high");
  const [notes, setNotes] = useState("");
  const [recommendedAction, setRecommendedAction] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("cervicallens_token") : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/slides/${slideId}`, { headers }).then((r) => r.ok ? r.json() : null),
      fetch(`${API_BASE}/reviews/slide/${slideId}`, { headers }).then((r) => r.ok ? r.json() : []),
    ])
      .then(([slideData, reviewData]) => {
        setSlide(slideData);
        setReviews(reviewData || []);
        if (slideData?.ai_classification) setClassification(slideData.ai_classification);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slideId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reviews/`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          slide_id: slideId,
          classification,
          decision,
          confidence,
          notes: notes || undefined,
          recommended_action: recommendedAction || undefined,
          is_urgent: isUrgent,
        }),
      });
      if (res.ok) router.push("/review-queue");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold font-sans text-on-surface">Slide not found</h2>
      </div>
    );
  }

  const canReview = slide.status === "flagged_for_review" || slide.status === "under_review";

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-sans text-on-surface">{slide.slide_code}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={slide.status} />
            {slide.risk_level && <RiskBadge risk={slide.risk_level} />}
          </div>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <MicroscopeViewer slide={slide} />

          <Card>
            <h3 className="text-2xl font-bold font-sans text-on-surface mb-4">AI Triage Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-sans">Classification</p>
                <p className="text-sm font-semibold text-on-surface mt-1 font-sans">
                  {slide.ai_classification || "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-sans">Confidence</p>
                <p className="text-sm font-semibold text-on-surface mt-1 font-sans">
                  {slide.confidence_score ? `${(slide.confidence_score * 100).toFixed(1)}%` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-sans">Inference Time</p>
                <p className="text-sm font-semibold text-on-surface mt-1 font-sans">
                  {slide.inference_time_ms ? `${slide.inference_time_ms}ms` : "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant uppercase font-sans">Model Version</p>
                <p className="text-sm font-semibold text-on-surface mt-1 font-sans">
                  {slide.model_version || "-"}
                </p>
              </div>
            </div>

            {slide.ai_predictions && (
              <div className="mt-6">
                <p className="text-xs text-on-surface-variant uppercase mb-3 font-sans">
                  Class Probabilities
                </p>
                <div className="space-y-2">
                  {Object.entries(slide.ai_predictions)
                    .sort(([, a], [, b]) => b - a)
                    .map(([cls, prob]) => (
                      <div key={cls} className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-on-surface w-16 font-sans">
                          {cls}
                        </span>
                        <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-on-surface-variant w-12 text-right font-sans">
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-2xl font-bold font-sans text-on-surface mb-4">Slide Info</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-on-surface-variant uppercase font-sans">Patient ID</dt>
                <dd className="text-sm font-semibold text-on-surface font-sans">{slide.patient_id}</dd>
              </div>
              <div>
                <dt className="text-xs text-on-surface-variant uppercase font-sans">Captured</dt>
                <dd className="text-sm font-semibold text-on-surface font-sans">
                  {new Date(slide.captured_at).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-on-surface-variant uppercase font-sans">Magnification</dt>
                <dd className="text-sm font-semibold text-on-surface font-sans">
                  {slide.magnification || "Unknown"}
                </dd>
              </div>
            </dl>
          </Card>

          {canReview && (
            <Card>
              <h3 className="text-2xl font-bold font-sans text-on-surface mb-4">Submit Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs text-on-surface-variant uppercase mb-1 font-sans">
                    Your Classification
                  </label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as CellClassification)}
                    className="w-full px-3 py-2 rounded-lg border border-sand bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  >
                    {CLASSIFICATIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase mb-1 font-sans">
                    Decision
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as ReviewDecision)}
                    className="w-full px-3 py-2 rounded-lg border border-sand bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  >
                    {DECISIONS.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase mb-1 font-sans">
                    Recommended Action
                  </label>
                  <input
                    type="text"
                    value={recommendedAction}
                    onChange={(e) => setRecommendedAction(e.target.value)}
                    placeholder="e.g., Colposcopy, Repeat in 6 months"
                    className="w-full px-3 py-2 rounded-lg border border-sand bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs text-on-surface-variant uppercase mb-1 font-sans">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Additional observations..."
                    className="w-full px-3 py-2 rounded-lg border border-sand bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none font-sans"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-sans">
                  <input
                    type="checkbox"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded border-sand text-fresh-accent-green focus:ring-primary"
                  />
                  <span className="text-sm text-on-surface">Mark as urgent</span>
                </label>

                <Button type="submit" variant="primary" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </Card>
          )}

          {reviews.length > 0 && (
            <Card>
              <h3 className="text-2xl font-bold font-sans text-on-surface mb-4">Previous Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-surface-container rounded-lg">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-on-surface font-sans">
                        {review.classification}
                      </span>
                      {review.is_urgent && (
                        <span className="text-xs font-semibold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-sans">
                          URGENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1 font-sans">
                      {review.decision.replace(/_/g, " ")}
                    </p>
                    {review.notes && (
                      <p className="text-sm text-on-surface mt-2 font-sans">{review.notes}</p>
                    )}
                    {review.recommended_action && (
                      <p className="text-xs text-primary mt-1 font-sans">
                        Action: {review.recommended_action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Microscope cell generator function
function getCellsForClassification(cls: string): {
  id: number;
  x: number;
  y: number;
  rx: number;
  ry: number;
  nr: number;
  isAbnormal: boolean;
  type: string;
  notes: string;
}[] {
  const isHighSeverity = ["HSIL", "SCC", "ASC-H"].includes(cls);
  const isLowSeverity = ["LSIL", "ASC-US", "AGC"].includes(cls);

  if (isHighSeverity) {
    return [
      { id: 1, x: 25, y: 30, rx: 42, ry: 38, nr: 22, isAbnormal: true, type: "Severe Dyskaryosis", notes: "Irregular nuclear membrane, coarse chromatin, high nuclear/cytoplasmic ratio." },
      { id: 2, x: 65, y: 35, rx: 35, ry: 32, nr: 20, isAbnormal: true, type: "Hyperchromatic Nucleus", notes: "Marked nuclear hyperchromasia, multinucleation present." },
      { id: 3, x: 45, y: 70, rx: 50, ry: 48, nr: 8, isAbnormal: false, type: "Normal Intermediate Cell", notes: "Healthy intermediate squamous cell with normal tiny nucleus." },
      { id: 4, x: 75, y: 75, rx: 38, ry: 42, nr: 24, isAbnormal: true, type: "Atypical Squamous Cell", notes: "Markedly enlarged nucleus, chromatin clumping." },
      { id: 5, x: 15, y: 65, rx: 48, ry: 46, nr: 6, isAbnormal: false, type: "Normal Superficial Cell", notes: "Healthy polygonal superficial squamous cell." }
    ];
  }

  if (isLowSeverity) {
    return [
      { id: 1, x: 30, y: 35, rx: 52, ry: 48, nr: 14, isAbnormal: true, type: "Koilocyte (HPV infected)", notes: "Enlarged nucleus with prominent perinuclear halo (cavity)." },
      { id: 2, x: 70, y: 30, rx: 46, ry: 48, nr: 6, isAbnormal: false, type: "Normal Intermediate Cell", notes: "Healthy intermediate squamous cell." },
      { id: 3, x: 50, y: 65, rx: 48, ry: 44, nr: 12, isAbnormal: true, type: "Mild Dyskaryosis", notes: "Slightly enlarged, dark nucleus, binucleation." },
      { id: 4, x: 20, y: 70, rx: 50, ry: 50, nr: 5, isAbnormal: false, type: "Normal Superficial Cell", notes: "Normal superficial cell with pyknotic nucleus." }
    ];
  }

  // Default NILM / Normal cells
  return [
    { id: 1, x: 25, y: 25, rx: 52, ry: 48, nr: 5, isAbnormal: false, type: "Normal Intermediate Cell", notes: "Abundant flat cytoplasm, small central pyknotic nucleus." },
    { id: 2, x: 70, y: 35, rx: 48, ry: 52, nr: 6, isAbnormal: false, type: "Normal Superficial Cell", notes: "Polygonal cytoplasm, tiny condensed nucleus." },
    { id: 3, x: 45, y: 65, rx: 55, ry: 45, nr: 5, isAbnormal: false, type: "Normal Intermediate Cell", notes: "Normal glycogenated cytoplasm, healthy borders." },
    { id: 4, x: 80, y: 70, rx: 50, ry: 48, nr: 5, isAbnormal: false, type: "Normal Superficial Cell", notes: "Classic mature superficial squamous cell." }
  ];
}

function MicroscopeViewer({ slide }: { slide: Slide }) {
  const [zoom, setZoom] = useState<"20x" | "40x" | "100x">("40x");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showAIBoxes, setShowAIBoxes] = useState(true);
  const [activeCell, setActiveCell] = useState<number | null>(null);

  const cells = getCellsForClassification(slide.ai_classification || "NILM");

  const zoomScales = {
    "20x": 1.0,
    "40x": 1.6,
    "100x": 2.8,
  };

  const currentScale = zoomScales[zoom];

  return (
    <div className="bg-surface-container-lowest rounded-card border border-sand p-6 flex flex-col space-y-6 hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Interactive Microscope Viewer</h2>
          <p className="text-xs text-outline font-sans mt-0.5">Simulated cytological slide analysis at multiple focal levels</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Zoom Selector */}
          <div className="bg-surface-container rounded-pill p-1 flex items-center">
            {(["20x", "40x", "100x"] as const).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-3 py-1 text-xs font-semibold rounded-pill transition-all ${
                  zoom === z
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          {/* AI Box Toggle */}
          <button
            onClick={() => setShowAIBoxes(!showAIBoxes)}
            className={`px-4 py-2 text-xs font-semibold rounded-pill border transition-all ${
              showAIBoxes
                ? "bg-primary-container text-on-primary-container border-primary-container"
                : "bg-transparent text-on-surface-variant border-sand hover:bg-surface-container"
            }`}
          >
            AI Bounding Boxes: {showAIBoxes ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* The Microscope Canvas */}
        <div className="md:col-span-8 flex flex-col space-y-3">
          <div className="relative aspect-[4/3] bg-[#EAE8E0] rounded-xl overflow-hidden border border-sand shadow-inner flex items-center justify-center">
            
            {/* Microscope Circular Reticle Overlay */}
            <div className="absolute inset-0 border-[32px] border-on-surface/90 rounded-full pointer-events-none z-30 opacity-15" />
            <div className="absolute w-full h-px bg-on-surface/5 pointer-events-none z-30" />
            <div className="absolute h-full w-px bg-on-surface/5 pointer-events-none z-30" />

            {/* Hemocytometer grid */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.03] pointer-events-none z-10">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-on-surface" />
              ))}
            </div>

            {/* Slide Image Canvas container */}
            <div 
              className="absolute inset-0 transition-transform duration-500 ease-out origin-center"
              style={{
                transform: `scale(${currentScale})`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              }}
            >
              {/* Cytoplasm & Nucleus SVG Elements */}
              <svg className="w-full h-full" viewBox="0 0 500 375">
                {cells.map((cell) => {
                  const isActive = activeCell === cell.id;
                  
                  return (
                    <g 
                      key={cell.id} 
                      className="cursor-pointer"
                      onClick={() => setActiveCell(isActive ? null : cell.id)}
                    >
                      {/* Cytoplasm */}
                      <ellipse 
                        cx={cell.x * 5} 
                        cy={cell.y * 3.75} 
                        rx={cell.rx} 
                        ry={cell.ry} 
                        fill={cell.isAbnormal ? "rgba(254, 121, 81, 0.45)" : "rgba(81, 150, 254, 0.35)"}
                        stroke={cell.isAbnormal ? "rgba(167, 57, 23, 0.6)" : "rgba(0, 92, 185, 0.4)"}
                        strokeWidth={isActive ? 2.5 : 1}
                        className="transition-all hover:opacity-90"
                      />

                      {/* Nucleus */}
                      <ellipse 
                        cx={cell.x * 5} 
                        cy={cell.y * 3.75} 
                        rx={cell.nr} 
                        ry={cell.nr * 0.95} 
                        fill={cell.isAbnormal ? "rgba(43, 8, 84, 0.85)" : "rgba(0, 27, 62, 0.75)"}
                        stroke="rgba(0, 0, 0, 0.4)"
                        strokeWidth={1}
                      />

                      {/* Perinuclear Halo for Koilocytes */}
                      {cell.type.includes("Koilocyte") && (
                        <ellipse 
                          cx={cell.x * 5} 
                          cy={cell.y * 3.75} 
                          rx={cell.nr * 2.2} 
                          ry={cell.nr * 2.1} 
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.6)"
                          strokeWidth={1.5}
                          strokeDasharray="3,3"
                        />
                      )}

                      {/* Bounding box / Target overlay */}
                      {showAIBoxes && cell.isAbnormal && (
                        <g>
                          <rect 
                            x={(cell.x * 5) - cell.rx - 6} 
                            y={(cell.y * 3.75) - cell.ry - 6} 
                            width={(cell.rx * 2) + 12} 
                            height={(cell.ry * 2) + 12} 
                            fill="none" 
                            stroke="var(--color-error)" 
                            strokeWidth={1.5} 
                            strokeDasharray="4,4"
                          />
                          <text 
                            x={(cell.x * 5) - cell.rx - 5}
                            y={(cell.y * 3.75) - cell.ry - 10}
                            fill="var(--color-error)"
                            fontSize="9"
                            fontFamily="monospace"
                            fontWeight="bold"
                            className="bg-black px-1"
                          >
                            AI: {slide.confidence_score ? `${(slide.confidence_score * 100).toFixed(0)}%` : "92%"}
                          </text>
                        </g>
                      )}

                      {/* Selection highlight reticle */}
                      {isActive && (
                        <g>
                          <circle 
                            cx={cell.x * 5} 
                            cy={cell.y * 3.75} 
                            r={Math.max(cell.rx, cell.ry) + 12}
                            fill="none" 
                            stroke="var(--color-primary)" 
                            strokeWidth={1.5}
                          />
                          <line x1={(cell.x * 5) - 4} y1={cell.y * 3.75} x2={(cell.x * 5) + 4} y2={cell.y * 3.75} stroke="var(--color-primary)" strokeWidth={1} />
                          <line x1={cell.x * 5} y1={(cell.y * 3.75) - 4} x2={cell.x * 5} y2={(cell.y * 3.75) + 4} stroke="var(--color-primary)" strokeWidth={1} />
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
            
            {/* Focal indicator */}
            <span className="absolute bottom-4 left-4 bg-on-surface/85 text-surface-container-lowest text-[10px] font-mono px-2 py-0.5 rounded z-20">
              Focus: Stable (100%)
            </span>
          </div>

          {/* Micro Adjustments */}
          <div className="grid grid-cols-2 gap-4 bg-surface-container-low p-3 rounded-lg border border-sand/40">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase text-outline">Lens Contrast ({contrast}%)</span>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full h-1 bg-sand accent-primary rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold uppercase text-outline">Light Intensity ({brightness}%)</span>
              <input 
                type="range" 
                min="50" 
                max="150" 
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full h-1 bg-sand accent-primary rounded-lg appearance-none cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        {/* The Diagnostic Panel */}
        <div className="md:col-span-4 bg-surface-container-low rounded-xl p-6 border border-sand/40 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-outline mb-4">Cytological Examination</h3>
            
            {activeCell !== null ? (
              (() => {
                const cell = cells.find(c => c.id === activeCell);
                if (!cell) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-3.5 h-3.5 rounded-full ${cell.isAbnormal ? "bg-error animate-pulse" : "bg-primary"}`} />
                      <span className="text-sm font-bold text-on-surface">{cell.type}</span>
                    </div>
                    <div className="space-y-2 text-xs text-on-surface-variant font-sans">
                      <p className="bg-surface-container-lowest p-3 rounded border border-sand/30 italic">
                        "{cell.notes}"
                      </p>
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <span className="text-outline uppercase text-[9px] block">N:C Ratio</span>
                          <span className="font-mono font-semibold text-on-surface">
                            {cell.isAbnormal ? "1:2 (High)" : "1:8 (Normal)"}
                          </span>
                        </div>
                        <div>
                          <span className="text-outline uppercase text-[9px] block">Cytoplasm Size</span>
                          <span className="font-mono font-semibold text-on-surface">
                            {cell.rx * 2}µm × {cell.ry * 2}µm
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-outline uppercase text-[9px] block">Nucleus Diameter</span>
                          <span className="font-mono font-semibold text-on-surface">
                            {(cell.nr * 2 * 0.3).toFixed(1)}µm
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="text-outline uppercase text-[9px] block">Severity</span>
                          <span className={`font-semibold ${cell.isAbnormal ? "text-error" : "text-primary"}`}>
                            {cell.isAbnormal ? "Dysplastic" : "Normal"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-12 text-on-surface-variant text-xs font-sans">
                <svg className="w-10 h-10 text-outline/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Select any cellular body on the slide to inspect detailed cytological structure and parameters.
              </div>
            )}
          </div>

          <div className="border-t border-sand/40 pt-4 mt-6">
            <span className="text-[10px] font-mono text-outline uppercase block mb-1">Slide Coordinates</span>
            <span className="font-mono text-xs text-on-surface font-semibold block">
              X: 184.22 · Y: 92.51 · Z: 14.88
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
