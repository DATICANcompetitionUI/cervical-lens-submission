"use client";

import { useEffect, useState } from "react";
import { Skeleton, Input } from "@cervical-lens/ui";
import type { Patient } from "@cervical-lens/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("cervicallens_token");
    const sp = new URLSearchParams();
    if (search) sp.set("search", search);

    fetch(`${API_BASE}/patients?${sp.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPatients(Array.isArray(data) ? data : []))
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-ink-10 pb-6">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary font-sans">
          Clinical Archives
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">Patients</h1>
        <p className="text-sm text-on-surface-variant font-sans mt-2">
          Comprehensive patient demographic records, historic triage screening, and genomic HPV status.
        </p>
      </div>

      {/* Search Input Row */}
      <div className="bg-surface-container-low p-4 rounded-xl border border-sand/40 max-w-md">
        <div className="relative">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient code or region..."
            className="w-full pl-9"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-sm">search</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest rounded-card border border-sand overflow-hidden hover:shadow-md transition-shadow duration-300">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sand bg-surface-container">
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Patient Code
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Age
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Region
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                HPV Status
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Previous Screening
              </th>
              <th className="text-left px-6 py-3.5 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider font-mono">
                Registered
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
              : patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4.5 text-sm font-semibold text-on-surface font-sans">
                      {patient.patient_code}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-on-surface font-mono font-medium">
                      {patient.age ?? "-"}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-on-surface font-sans">
                      {patient.region || "-"}
                    </td>
                    <td className="px-6 py-4.5 text-sm font-semibold font-sans">
                      {patient.hpv_status ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            patient.hpv_status.toLowerCase().includes("pos")
                              ? "bg-red-100 text-red-700"
                              : patient.hpv_status.toLowerCase().includes("neg")
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-surface-container text-on-surface-variant"
                          }`}
                        >
                          {patient.hpv_status}
                        </span>
                      ) : (
                        <span className="text-outline">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-on-surface font-sans">
                      {patient.previous_screening_result || "-"}
                    </td>
                    <td className="px-6 py-4.5 text-sm text-on-surface-variant font-sans">
                      {new Date(patient.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>

        {!loading && patients.length === 0 && (
          <div className="text-center py-16 bg-surface-container-lowest rounded-card border border-sand">
            <svg className="w-12 h-12 text-outline/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <h3 className="text-base font-bold text-on-surface font-sans">No patients archived</h3>
            <p className="text-xs text-on-surface-variant mt-1 font-sans">There are no patient records matching your filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
