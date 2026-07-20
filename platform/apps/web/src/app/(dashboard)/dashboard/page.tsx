"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@cervical-lens/ui";
import type { SlideSummaryStats } from "@cervical-lens/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function DashboardPage() {
  const [stats, setStats] = useState<SlideSummaryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("cervicallens_token");
    fetch(`${API_BASE}/slides/stats`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setStats(
          data || {
            total_slides: 0,
            pending_inference: 0,
            flagged_for_review: 0,
            under_review: 0,
            review_complete: 0,
            high_risk_count: 0,
          }
        );
      })
      .catch(() => {
        setStats({
          total_slides: 0,
          pending_inference: 0,
          flagged_for_review: 0,
          under_review: 0,
          review_complete: 0,
          high_risk_count: 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-10">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-ink-10 pb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
            Diagnostic Workspace
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mt-1">
            Pathologist Command Center
          </h1>
          <p className="text-sm text-on-surface-variant font-sans mt-2">
            Real-time screening triage, genomics risk profiling, and diagnostic validation.
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-left md:text-right">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant font-mono">
            System Status
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-on-surface font-sans">
              AI Triage Active
            </span>
          </div>
          <p className="text-xs text-outline mt-1 font-sans">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Screened"
            value={stats?.total_slides ?? 0}
            desc="Accumulated cases"
            dotColor="bg-blue-500"
          />
          <StatCard
            label="Pending AI"
            value={stats?.pending_inference ?? 0}
            desc="In queue"
            dotColor="bg-amber-500"
            highlight={stats?.pending_inference ? stats.pending_inference > 0 : false}
          />
          <StatCard
            label="Needs Review"
            value={stats?.flagged_for_review ?? 0}
            desc="Pathologist action"
            dotColor="bg-red-500"
            highlight={stats?.flagged_for_review ? stats.flagged_for_review > 0 : false}
          />
          <StatCard
            label="High-Risk Cases"
            value={stats?.high_risk_count ?? 0}
            desc="Flagged critical"
            dotColor="bg-red-700 font-bold"
            accent
          />
          <StatCard
            label="Completed Reviews"
            value={stats?.review_complete ?? 0}
            desc="Archived cases"
            dotColor="bg-emerald-500"
          />
        </div>
      )}

      {/* Command center layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-surface-container-lowest rounded-card p-8 border border-sand flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-on-surface">Screening Throughput</h2>
              <p className="text-xs text-outline font-sans mt-0.5">Clinical processing statistics (14-day window)</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-pill">
              <span className="material-symbols-outlined text-primary text-sm">monitoring</span>
              <span className="text-xs font-semibold text-on-surface font-sans">Active Live Feed</span>
            </div>
          </div>
          
          <div className="flex-grow bg-surface-container-low rounded-xl border border-outline-variant/30 flex flex-col justify-end min-h-[260px] relative overflow-hidden p-6 group">
            {/* SVG Grid Lines */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-outline-variant/30 w-full h-0" />
              <div className="border-b border-dashed border-outline-variant/30 w-full h-0" />
              <div className="border-b border-dashed border-outline-variant/30 w-full h-0" />
              <div className="border-b border-dashed border-outline-variant/30 w-full h-0" />
            </div>

            {/* Custom SVG Path Chart */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path 
                d="M -5 105 L -5 85 Q 15 78 30 65 T 60 72 T 85 45 T 105 35 L 105 105 Z" 
                fill="url(#chart-grad)" 
                className="transition-all duration-700 ease-in-out"
              />
              <path 
                d="M -5 85 Q 15 78 30 65 T 60 72 T 85 45 T 105 35" 
                fill="none" 
                stroke="var(--color-primary)" 
                strokeWidth={2.5} 
                strokeLinecap="round"
                className="transition-all duration-700 ease-in-out"
              />
            </svg>
            
            {/* Chart X Axis Labels */}
            <div className="flex justify-between text-[10px] font-mono text-outline z-10 w-full mt-auto">
              <span>07/04</span>
              <span>07/07</span>
              <span>07/10</span>
              <span>07/13</span>
              <span>07/16</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-4 bg-on-surface text-inverse-on-surface rounded-card p-8 flex flex-col hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-surface-container-lowest">Risk Distribution</h2>
              <p className="text-xs text-surface-variant font-sans mt-0.5">Cohort risk profiling</p>
            </div>
            <span className="material-symbols-outlined text-surface-variant">pie_chart</span>
          </div>

          <div className="flex-grow flex flex-col justify-center gap-6">
            {/* Custom Premium progress bar charts for risk stratification */}
            <div className="space-y-4">
              <RiskRow 
                label="High / Critical Risk" 
                count={stats?.high_risk_count ?? 0} 
                total={stats?.total_slides ?? 1} 
                color="bg-red-500" 
              />
              <RiskRow 
                label="Needs Review Queue" 
                count={stats?.flagged_for_review ?? 0} 
                total={stats?.total_slides ?? 1} 
                color="bg-amber-500" 
              />
              <RiskRow 
                label="Normal / NILM" 
                count={stats ? (stats.total_slides - stats.high_risk_count - stats.flagged_for_review) : 0} 
                total={stats?.total_slides ?? 1} 
                color="bg-emerald-500" 
              />
            </div>

            <div className="border-t border-surface-variant/30 pt-4 flex justify-between items-center">
              <span className="text-xs text-surface-variant uppercase font-mono">Cohort Size</span>
              <span className="text-2xl font-extrabold text-surface-container-lowest font-display">{stats?.total_slides ?? 0} Cases</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-on-surface border-b border-ink-10 pb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickLink
            href="/review-queue"
            title="Review Queue"
            desc="AI-flagged slides awaiting pathologist confirmation"
            icon="fact_check"
          />
          <QuickLink
            href="/slides"
            title="All Slides"
            desc="Browse submitted Pap smear slides and AI triage results"
            icon="grid_view"
          />
          <QuickLink
            href="/genomics"
            title="Genomics Risk"
            desc="2-axis prognostic risk from HPV integration + mutational signatures"
            icon="biotech"
          />
          <QuickLink
            href="/patients"
            title="Patients"
            desc="Demographics, screening history, and risk"
            icon="group"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  desc,
  dotColor,
  highlight = false,
  accent = false,
}: {
  label: string;
  value: number;
  desc: string;
  dotColor: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      className={`p-6 rounded-card border transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
        accent
          ? "bg-on-surface text-inverse-on-surface border-transparent"
          : highlight
          ? "bg-surface-container-low border-secondary/30"
          : "bg-surface-container-lowest border-sand"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-surface-variant" : "text-on-surface-variant"
          }`}
        >
          {label}
        </span>
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
      </div>
      <div
        className={`text-4xl font-extrabold tracking-tight ${
          accent ? "text-surface-container-lowest" : highlight ? "text-secondary" : "text-on-surface"
        }`}
      >
        {value}
      </div>
      <p
        className={`text-xs mt-1 ${
          accent ? "text-surface-variant/80" : "text-outline"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}

function RiskRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-surface-variant font-sans font-medium">{label}</span>
        <span className="font-semibold font-mono text-surface-container-lowest">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
}

function QuickLink({
  href,
  title,
  desc,
  icon,
}: {
  href: string;
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-surface-container-lowest rounded-card border border-sand hover:border-primary hover:shadow-md transition-all duration-300 group"
    >
      <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-container group-hover:text-on-primary-container transition-all duration-300">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="text-base font-bold text-on-surface mb-1 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-on-surface-variant line-clamp-2">{desc}</p>
    </Link>
  );
}
