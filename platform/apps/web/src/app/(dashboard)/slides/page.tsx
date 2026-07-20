"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RiskBadge, StatusBadge, Skeleton, Button } from "@cervical-lens/ui";
import type { Slide } from "@cervical-lens/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const perPage = 20;

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("cervicallens_token");
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("per_page", String(perPage));
    if (statusFilter) sp.set("status", statusFilter);
    if (riskFilter) sp.set("risk", riskFilter);

    fetch(`${API_BASE}/slides?${sp.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : { slides: [], total: 0 }))
      .then((data) => {
        setSlides(data.slides || []);
        setTotal(data.total || 0);
      })
      .catch(() => {
        setSlides([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, statusFilter, riskFilter]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-ink-10 pb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
          Slide Repository
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">Slides</h1>
        <p className="text-sm text-on-surface-variant font-sans mt-2">
          Comprehensive archive of patient whole-slide scans, cytological classifications, and triage metrics.
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-container-low p-4 rounded-xl border border-sand/40">
        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-sans">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-sand bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary font-sans"
          >
            <option value="">All Statuses</option>
            <option value="pending_inference">Pending AI</option>
            <option value="inference_complete">AI Complete</option>
            <option value="flagged_for_review">Needs Review</option>
            <option value="under_review">Under Review</option>
            <option value="review_complete">Reviewed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-on-surface-variant font-sans">Risk Level:</span>
          <select
            value={riskFilter}
            onChange={(e) => {
              setRiskFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-sand bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary font-sans"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Table container */}
      <div className="bg-surface-container-lowest rounded-card border border-sand overflow-hidden hover:shadow-md transition-shadow duration-300">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sand bg-surface-container">
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Slide Code
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Classification
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Risk
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Confidence
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Status
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4.5">
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              : slides.map((slide) => (
                  <tr
                    key={slide.id}
                    className="hover:bg-surface-container-low/40 transition-colors"
                  >
                    <td className="px-6 py-4.5">
                      <Link
                        href={`/slides/${slide.id}`}
                        className="text-sm font-semibold text-primary hover:underline font-sans"
                      >
                        {slide.slide_code}
                      </Link>
                    </td>
                    <td className="px-6 py-4.5 text-sm text-on-surface font-sans font-medium">
                      {slide.ai_classification || "-"}
                    </td>
                    <td className="px-6 py-4.5">
                      {slide.risk_level ? (
                        <RiskBadge risk={slide.risk_level} />
                      ) : (
                        <span className="text-sm text-on-surface-variant font-sans">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-on-surface font-mono font-medium">
                      {slide.confidence_score
                        ? `${(slide.confidence_score * 100).toFixed(1)}%`
                        : "-"}
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
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && slides.length === 0 && (
          <div className="text-center py-16 bg-surface-container-lowest rounded-card border border-sand">
            <svg className="w-12 h-12 text-outline/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-base font-bold text-on-surface font-sans">No slides uploaded</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-sans">There are no whole-slide scans in this filter view.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-on-surface-variant font-sans">
            Showing {(page - 1) * perPage + 1}-
            {Math.min(page * perPage, total)} of {total} slides
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
