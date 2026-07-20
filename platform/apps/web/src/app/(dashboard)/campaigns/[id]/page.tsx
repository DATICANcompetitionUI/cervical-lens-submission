"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Skeleton } from "@cervical-lens/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface CampaignDetails {
  id: number;
  name: string;
  description?: string;
  campaign_code: string;
  organization_name?: string;
  region?: string;
  country?: string;
  status: "draft" | "active" | "paused" | "completed";
  is_public: boolean;
  min_risk_threshold?: string;
  auto_flag_enabled: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

interface CampaignStats {
  total_slides: number;
  pending_review: number;
  under_review: number;
  completed: number;
  flagged_count: number;
  member_count: number;
  pathologist_count: number;
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: "owner" | "admin" | "pathologist" | "technician";
  status: "pending" | "accepted" | "declined" | "expired";
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("pathologist");
  const [notice, setNotice] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Form edit states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "paused" | "completed">("draft");
  const [isPublic, setIsPublic] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("cervicallens_token") : null;
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchData = async () => {
    try {
      // 1. Fetch details
      const detailRes = await fetch(`${API_BASE}/campaigns/${id}`, { headers });
      if (!detailRes.ok) {
        if (detailRes.status === 404) {
          router.push("/campaigns");
          return;
        }
        throw new Error();
      }
      const detailData = await detailRes.json();
      setCampaign(detailData);
      setName(detailData.name);
      setDescription(detailData.description || "");
      setRegion(detailData.region || "");
      setCountry(detailData.country || "");
      setStatus(detailData.status);
      setIsPublic(detailData.is_public);

      // 2. Fetch stats
      const statsRes = await fetch(`${API_BASE}/campaigns/${id}/stats`, { headers });
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      // 3. Fetch members
      const membersRes = await fetch(`${API_BASE}/campaigns/${id}/members`, { headers });
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (e) {
      setNotice({ message: "Error fetching campaign details.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_BASE}/campaigns/${id}`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          name,
          description,
          region,
          country,
          status,
          is_public: isPublic,
        }),
      });
      if (res.ok) {
        setNotice({ message: "Campaign updated successfully.", type: "success" });
        fetchData();
      } else {
        const err = await res.json();
        setNotice({ message: err.detail || "Update failed.", type: "error" });
      }
    } catch {
      setNotice({ message: "Could not reach the server.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setNotice(null);
    try {
      const res = await fetch(`${API_BASE}/campaigns/${id}/invite`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });
      if (res.ok) {
        setNotice({ message: "Invitation sent successfully.", type: "success" });
        setInviteEmail("");
        // Reload members
        const membersRes = await fetch(`${API_BASE}/campaigns/${id}/members`, { headers });
        if (membersRes.ok) {
          const membersData = await membersRes.json();
          setMembers(membersData.members || []);
        }
      } else {
        const err = await res.json();
        setNotice({ message: err.detail || "Invitation failed.", type: "error" });
      }
    } catch {
      setNotice({ message: "Could not reach the server.", type: "error" });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-24 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-ink-10 pb-6 flex justify-between items-end">
        <div>
          <Link href="/campaigns" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-2 font-sans">
            <span className="material-symbols-outlined text-xs">arrow_back</span> Back to Campaigns
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mt-1">{campaign?.name}</h1>
          <p className="text-xs text-outline font-mono mt-1.5 uppercase tracking-wider">
            Campaign Code: {campaign?.campaign_code}
          </p>
        </div>
        <div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            campaign?.status === "active" ? "bg-emerald-100 text-emerald-700" :
            campaign?.status === "draft" ? "bg-amber-100 text-amber-700" :
            campaign?.status === "paused" ? "bg-blue-100 text-blue-700" :
            "bg-surface-container text-on-surface-variant"
          }`}>
            {campaign?.status}
          </span>
        </div>
      </div>

      {notice && (
        <div className={`px-4 py-3 rounded-lg text-xs font-semibold border flex items-center gap-2 ${
          notice.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <span className="material-symbols-outlined text-sm">
            {notice.type === "success" ? "check_circle" : "info"}
          </span>
          {notice.message}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-surface-container-lowest border border-sand rounded-card hover:shadow-sm transition-shadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">Total Slides</span>
          <div className="text-3xl font-extrabold text-on-surface mt-1">{stats?.total_slides ?? 0}</div>
        </div>
        <div className="p-5 bg-surface-container-lowest border border-sand rounded-card hover:shadow-sm transition-shadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">Needs Review</span>
          <div className="text-3xl font-extrabold text-secondary mt-1">{stats?.flagged_count ?? 0}</div>
        </div>
        <div className="p-5 bg-surface-container-lowest border border-sand rounded-card hover:shadow-sm transition-shadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">Completed</span>
          <div className="text-3xl font-extrabold text-on-surface mt-1">{stats?.completed ?? 0}</div>
        </div>
        <div className="p-5 bg-surface-container-lowest border border-sand rounded-card hover:shadow-sm transition-shadow">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant font-mono">Team Members</span>
          <div className="text-3xl font-extrabold text-on-surface mt-1">{stats?.member_count ?? 0}</div>
        </div>
      </div>

      {/* Layout Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: edit form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-surface-container-lowest border border-sand rounded-card overflow-hidden">
            <CardHeader className="border-b border-sand bg-surface-container/30 px-6 py-4">
              <CardTitle className="text-lg font-bold text-on-surface">Campaign Configuration</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Campaign Name</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter campaign description..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Region</label>
                    <Input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      placeholder="e.g. Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Country</label>
                    <Input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. Nigeria"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full h-10 border border-sand bg-surface-container-lowest rounded-md px-3 text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 h-10 sm:mt-7">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-sand text-primary focus:ring-primary h-4 w-4"
                    />
                    <label htmlFor="isPublic" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer font-mono">
                      Make Publicly Searchable
                    </label>
                  </div>
                </div>
                <div className="pt-4 border-t border-sand flex justify-end">
                  <Button type="submit" disabled={updating}>
                    {updating ? "Saving..." : "Save Settings"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: team members and invitations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Invite Member Card */}
          <Card className="bg-surface-container-lowest border border-sand rounded-card overflow-hidden">
            <CardHeader className="border-b border-sand bg-surface-container/30 px-6 py-4">
              <CardTitle className="text-lg font-bold text-on-surface">Invite Practitioner</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Practitioner Email</label>
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="practitioner@hospital.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 font-mono">Role Assignment</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full h-10 border border-sand bg-surface-container-lowest rounded-md px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="pathologist">Pathologist (Reviewer)</option>
                    <option value="technician">Technician (Screener)</option>
                    <option value="admin">Campaign Admin</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button type="submit" disabled={inviting}>
                    {inviting ? "Inviting..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Members List Card */}
          <Card className="bg-surface-container-lowest border border-sand rounded-card overflow-hidden">
            <CardHeader className="border-b border-sand bg-surface-container/30 px-6 py-4">
              <CardTitle className="text-lg font-bold text-on-surface">Outreach Team</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {members.length === 0 ? (
                <div className="text-center py-6 text-xs text-outline font-sans">
                  No team members added yet.
                </div>
              ) : (
                <div className="divide-y divide-sand max-h-80 overflow-y-auto pr-1">
                  {members.map((m) => (
                    <div key={m.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                      <div>
                        <div className="text-sm font-semibold text-on-surface font-sans">{m.name}</div>
                        <div className="text-xs text-outline font-sans mt-0.5">{m.email}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">{m.role}</span>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          m.status === "accepted" ? "bg-emerald-50 text-emerald-700" :
                          m.status === "pending" ? "bg-amber-50 text-amber-600" :
                          "bg-surface-container text-on-surface-variant"
                        }`}>
                          {m.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
