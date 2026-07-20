export type NotificationType =
  | "flag_for_review"
  | "case_assigned"
  | "review_completed"
  | "invitation"
  | "campaign_update"
  | "system_alert";

export type NotificationStatus = "unread" | "read" | "archived";

export interface Notification {
  id: number;
  user_id: number;
  campaign_id?: number;
  slide_id?: number;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  priority: string;
  created_at: string;
  read_at?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
  page: number;
  per_page: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  by_type: Record<string, number>;
}
