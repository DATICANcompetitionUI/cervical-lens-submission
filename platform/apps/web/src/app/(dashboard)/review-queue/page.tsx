"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiskBadge, StatusBadge, Button, Skeleton } from "@cervical-lens/ui";
import type { Slide } from "@cervical-lens/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ReviewQueuePage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("cervicallens_token") : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetch(`${API_BASE}/slides?status=flagged_for_review&per_page=50`, { headers })
      .then((r) => (r.ok ? r.json() : { slides: [] }))
      .then((data) => setSlides(data.slides || []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  const handleClaim = async (slideId: number) => {
    try {
      await fetch(`${API_BASE}/reviews/${slideId}/claim`, {
        method: "POST",
        headers,
      });
      setSlides((prev) =>
        prev.map((s) =>
          s.id === slideId ? { ...s, status: "under_review" as const } : s
        )
      );
    } catch (err) {
      console.error("Failed to claim slide:", err);
    }
  };  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const filteredSlides = slides.filter((slide) => {
    const matchesSearch = slide.slide_code.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (slide.ai_classification && slide.ai_classification.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRisk = riskFilter === "all" || slide.risk_level === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const urgentCount = slides.filter((s) => s.risk_level === "critical" || s.risk_level === "high").length;
  const underReviewCount = slides.filter((s) => s.status === "under_review").length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-ink-10 pb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
          Diagnostic Queue
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">Review Queue</h1>
        <p className="text-sm text-on-surface-variant font-sans mt-2">
          Cases flagged by AI triage requiring cytological verification and diagnostic confirmation.
        </p>
      </div>

      {/* Queue Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-sand p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-outline">Total Flagged</span>
            <div className="text-2xl font-bold text-on-surface mt-0.5">{slides.length} Cases</div>
          </div>
          <span className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined">rule</span>
          </span>
        </div>
        <div className="bg-surface-container-lowest border border-sand p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-outline">Urgent Action</span>
            <div className="text-2xl font-bold text-secondary mt-0.5">{urgentCount} Cases</div>
          </div>
          <span className={`w-10 h-10 rounded-lg text-secondary flex items-center justify-center ${urgentCount > 0 ? "bg-secondary-container/25 animate-pulse" : "bg-surface-container"}`}>
            <span className="material-symbols-outlined">warning</span>
          </span>
        </div>
        <div className="bg-surface-container-lowest border border-sand p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-outline">Under Active Review</span>
            <div className="text-2xl font-bold text-on-surface mt-0.5">{underReviewCount} Cases</div>
          </div>
          <span className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
            <span className="material-symbols-outlined">edit_note</span>
          </span>
        </div>
      </div>

      {/* Search and Filters row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface-container-low p-4 rounded-xl border border-sand/40">
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder="Search slide code or class..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-sand bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary font-sans"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-sm">search</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-on-surface-variant font-sans">Filter Risk:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-sand bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary font-sans"
          >
            <option value="all">All Risks</option>
            <option value="low">Low Risk</option>
            <option value="medium">Moderate Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : filteredSlides.length === 0 ? (
        <div className="text-center py-16 bg-surface-container-lowest rounded-card border border-sand">
          <svg className="w-16 h-16 text-outline/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-bold text-on-surface font-sans">No matching records</h3>
          <p className="text-sm text-on-surface-variant mt-1 font-sans">
            Try adjusting your search criteria or filter options.
          </p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-card border border-sand overflow-hidden hover:shadow-md transition-shadow duration-300">
          <table className="w-full">
            <thead>
              <tr className="border-b border-sand bg-surface-container">
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Slide</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">AI Classification</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Risk Profile</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Confidence</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Status</th>
                <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Captured</th>
                <th className="text-right px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filteredSlides.map((slide) => (
                <tr key={slide.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-6 py-4.5">
                    <Link href={`/slides/${slide.id}`} className="text-sm font-semibold text-primary hover:underline font-sans">
                      {slide.slide_code}
                    </Link>
                  </td>
                  <td className="px-6 py-4.5 text-sm text-on-surface font-sans font-medium">
                    {slide.ai_classification || "Pending"}
                  </td>
                  <td className="px-6 py-4.5">
                    {slide.risk_level && <RiskBadge risk={slide.risk_level} />}
                  </td>
                  <td className="px-6 py-4.5 text-sm text-on-surface font-mono font-medium">
                    {slide.confidence_score ? `${(slide.confidence_score * 100).toFixed(1)}%` : "-"}
                  </td>
                  <td className="px-6 py-4.5">
                    <StatusBadge status={slide.status} />
                  </td>
                  <td className="px-6 py-4.5 text-sm text-on-surface-variant font-sans">
                    {new Date(slide.captured_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    {slide.status === "flagged_for_review" ? (
                      <Button variant="primary" size="sm" onClick={() => handleClaim(slide.id)}>
                        Claim & Review
                      </Button>
                    ) : (
                      <Link href={`/slides/${slide.id}`}>
                        <Button variant="outline" size="sm">View</Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
