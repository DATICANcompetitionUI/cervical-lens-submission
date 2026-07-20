export type CampaignStatus = "draft" | "active" | "paused" | "completed";
export type MemberRole = "owner" | "admin" | "pathologist" | "technician";
export type InvitationStatus = "pending" | "accepted" | "declined" | "expired";

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  campaign_code: string;
  organization_name?: string;
  region?: string;
  country?: string;
  status: CampaignStatus;
  is_public: boolean;
  min_risk_threshold: string;
  auto_flag_enabled: boolean;
  start_date?: string;
  end_date?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  total: number;
  page: number;
  per_page: number;
}

export interface CampaignStats {
  total_slides: number;
  pending_review: number;
  under_review: number;
  completed: number;
  flagged_count: number;
  member_count: number;
  pathologist_count: number;
}

export interface CampaignMember {
  id: number;
  campaign_id: number;
  user_id: number;
  role: MemberRole;
  invitation_status: InvitationStatus;
  cases_reviewed: number;
  last_active_at?: string;
  created_at: string;
  updated_at: string;
  user_full_name?: string;
  user_email?: string;
}

export interface CampaignMembersResponse {
  members: CampaignMember[];
  total: number;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
}

export interface InvitationResponse {
  id: number;
  campaign_id: number;
  user_id?: number;
  email: string;
  role: MemberRole;
  invitation_status: InvitationStatus;
  invitation_token?: string;
  invited_by?: number;
  invitation_sent_at?: string;
  invitation_expires_at?: string;
  created_at: string;
}

export interface AcceptInvitationRequest {
  invitation_token: string;
}
