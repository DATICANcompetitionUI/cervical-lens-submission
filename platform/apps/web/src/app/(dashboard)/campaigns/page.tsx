"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@cervical-lens/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface Campaign {
  id: number;
  name: string;
  description?: string;
  region?: string;
  status?: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("cervicallens_token");
    fetch(`${API_BASE}/campaigns`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : { campaigns: [] }))
      .then((data) => setCampaigns(data.campaigns || []))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  const createCampaign = async () => {
    setCreating(true);
    setNotice(null);
    try {
      const token = localStorage.getItem("cervicallens_token");
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      if (res.status === 501) {
        setNotice("Campaign creation isn't wired up on the backend yet.");
      } else if (res.ok) {
        const c = await res.json();
        setCampaigns((prev) => [...prev, c]);
      } else {
        setNotice(`Request failed (${res.status})`);
      }
    } catch {
      setNotice("Could not reach the API.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-ink-10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
            Community Outreach
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">Screening Campaigns</h1>
          <p className="text-sm text-on-surface-variant font-sans mt-2">
            Manage community screening drives — coverage, screen volumes, and risk flags across active deployment regions.
          </p>
        </div>
        <div>
          <button
            onClick={createCampaign}
            disabled={creating}
            className="bg-primary text-on-primary rounded-pill px-6 py-2.5 text-xs font-semibold hover:opacity-90 transition-all shadow-sm hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {creating ? "Creating…" : "+ New Campaign"}
          </button>
        </div>
      </div>

      {notice && (
        <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-xs font-semibold border border-error/20 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-surface-container-lowest border border-sand rounded-card p-16 text-center">
          <svg className="w-12 h-12 text-outline/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 4a2 2 0 00-2-2m-2 3h.01M5.5 8.5H6m-1 5H6m-1 3H6m3.5-8h.01m-.01 5h.01m-.01 3h.01" />
          </svg>
          <h3 className="text-base font-bold text-on-surface font-sans">No campaigns active</h3>
          <p className="text-xs text-on-surface-variant mt-1 font-sans">
            Create a campaign to organize regional healthcare screening drives.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className="bg-surface-container-lowest rounded-card border border-sand p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                    {c.name}
                  </h3>
                </div>
                {c.description && (
                  <p className="text-sm text-on-surface-variant line-clamp-2">{c.description}</p>
                )}
              </div>
              <div className="w-10 h-10 rounded-full border border-sand bg-surface-container-low flex items-center justify-center text-on-surface group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary transition-all duration-300">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
