import type { ApiClient } from "./client";
import type {
  TokenResponse,
  User,
  SlideListResponse,
  Slide,
  SlideSummaryStats,
  Patient,
  PatientCreate,
  Review,
  ReviewCreate,
  Campaign,
  CampaignListResponse,
  CampaignStats,
  CampaignMember,
  CampaignMembersResponse,
  InviteMemberRequest,
  InvitationResponse,
  AcceptInvitationRequest,
  Notification,
  NotificationListResponse,
  NotificationStats,
} from "../types";

export function createEndpoints(client: ApiClient) {
  return {
    auth: {
      login: (email: string, password: string) =>
        client.post<TokenResponse>("/auth/login", { email, password }),
      register: (data: {
        email: string;
        password: string;
        full_name: string;
        role: string;
        institution?: string;
        license_number?: string;
        clinic_name?: string;
        clinic_region?: string;
      }) => client.post<TokenResponse>("/auth/register", data),
      getProfile: () => client.get<User>("/auth/me"),
      updateProfile: (data: Record<string, unknown>) =>
        client.patch<User>("/auth/me", data),
    },

    slides: {
      list: (params?: {
        page?: number;
        per_page?: number;
        status?: string;
        risk?: string;
      }) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set("page", String(params.page));
        if (params?.per_page) sp.set("per_page", String(params.per_page));
        if (params?.status) sp.set("status", params.status);
        if (params?.risk) sp.set("risk", params.risk);
        const q = sp.toString();
        return client.get<SlideListResponse>(`/slides/${q ? `?${q}` : ""}`);
      },
      get: (id: number) => client.get<Slide>(`/slides/${id}`),
      stats: () => client.get<SlideSummaryStats>("/slides/stats"),
      upload: (formData: FormData) => client.upload<Slide>("/slides/upload", formData),
      submitInference: (slideId: number, data: Record<string, unknown>) =>
        client.post<Slide>(`/slides/${slideId}/inference`, data),
      analyze: (slideId: number) =>
        client.post<Slide>(`/slides/${slideId}/analyze`),
    },

    reviews: {
      create: (data: ReviewCreate) => client.post<Review>("/reviews/", data),
      forSlide: (slideId: number) =>
        client.get<Review[]>(`/reviews/slide/${slideId}`),
      myReviews: (page = 1, perPage = 20) =>
        client.get<Review[]>(`/reviews/my-reviews?page=${page}&per_page=${perPage}`),
      claim: (slideId: number) =>
        client.post<{ message: string; slide_id: number; status: string }>(
          `/reviews/${slideId}/claim`
        ),
    },

    patients: {
      list: (params?: { page?: number; search?: string }) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set("page", String(params.page));
        if (params?.search) sp.set("search", params.search);
        const q = sp.toString();
        return client.get<Patient[]>(`/patients/${q ? `?${q}` : ""}`);
      },
      get: (id: number) => client.get<Patient>(`/patients/${id}`),
      create: (data: PatientCreate) => client.post<Patient>("/patients/", data),
      update: (id: number, data: Record<string, unknown>) =>
        client.patch<Patient>(`/patients/${id}`, data),
    },

    campaigns: {
      list: (params?: { page?: number; per_page?: number; status_filter?: string }) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set("page", String(params.page));
        if (params?.per_page) sp.set("per_page", String(params.per_page));
        if (params?.status_filter) sp.set("status_filter", params.status_filter);
        const q = sp.toString();
        return client.get<CampaignListResponse>(`/campaigns/${q ? `?${q}` : ""}`);
      },
      get: (id: number) => client.get<Campaign>(`/campaigns/${id}`),
      stats: (id: number) => client.get<CampaignStats>(`/campaigns/${id}/stats`),
      create: (data: Record<string, unknown>) =>
        client.post<Campaign>("/campaigns/", data),
      update: (id: number, data: Record<string, unknown>) =>
        client.patch<Campaign>(`/campaigns/${id}`, data),
      activate: (id: number) =>
        client.post<Campaign>(`/campaigns/${id}/activate`),
      invite: (campaignId: number, data: InviteMemberRequest) =>
        client.post<InvitationResponse>(`/campaigns/${campaignId}/invite`, data),
      members: (campaignId: number, params?: { page?: number; per_page?: number }) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set("page", String(params.page));
        if (params?.per_page) sp.set("per_page", String(params.per_page));
        const q = sp.toString();
        return client.get<CampaignMembersResponse>(
          `/campaigns/${campaignId}/members${q ? `?${q}` : ""}`
        );
      },
      acceptInvitation: (data: AcceptInvitationRequest) =>
        client.post<CampaignMember>("/campaigns/invitations/accept", data),
      leave: (campaignId: number) =>
        client.post(`/campaigns/${campaignId}/leave`),
    },

    notifications: {
      list: (params?: {
        page?: number;
        per_page?: number;
        status_filter?: string;
        notification_type?: string;
      }) => {
        const sp = new URLSearchParams();
        if (params?.page) sp.set("page", String(params.page));
        if (params?.per_page) sp.set("per_page", String(params.per_page));
        if (params?.status_filter) sp.set("status_filter", params.status_filter);
        if (params?.notification_type) sp.set("notification_type", params.notification_type);
        const q = sp.toString();
        return client.get<NotificationListResponse>(`/notifications/${q ? `?${q}` : ""}`);
      },
      stats: () => client.get<NotificationStats>("/notifications/stats"),
      urgent: () => client.get<Notification[]>("/notifications/urgent"),
      get: (id: number) => client.get<Notification>(`/notifications/${id}`),
      markRead: (id: number) =>
        client.post<Notification>(`/notifications/${id}/mark-read`),
      markAllRead: () =>
        client.post<{ marked_count: number }>("/notifications/mark-all-read"),
      delete: (id: number) => client.del(`/notifications/${id}`),
    },

    deviceTokens: {
      register: (data: { token: string; device_type: string; device_name?: string }) =>
        client.post("/device-tokens/register", data),
      unregister: (token: string) =>
        client.del(`/device-tokens/${encodeURIComponent(token)}`),
      myTokens: () => client.get("/device-tokens/my-tokens"),
    },
  };
}
