import { pgTable, text, integer, real, boolean, timestamp, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Better Auth tables (canonical schema — see better-auth.com/docs/concepts/database).
 * `user` carries our domain fields (role, clinic info) as additionalFields.
 */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // --- domain additional fields ---
  role: text("role", { enum: ["technician", "pathologist", "admin"] }).notNull().default("technician"),
  isActive: boolean("is_active").notNull().default(true),
  licenseNumber: text("license_number"),
  institution: text("institution"),
  specialization: text("specialization"),
  clinicName: text("clinic_name"),
  clinicRegion: text("clinic_region"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Domain tables. FK columns pointing at users are `text` to match Better
 * Auth's user.id (string) — everything else keeps its own serial PK.
 */
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientCode: text("patient_code").notNull().unique(),
  age: integer("age"),
  dateOfBirth: text("date_of_birth"),
  region: text("region"),
  clinicName: text("clinic_name"),
  hpvStatus: text("hpv_status"),
  parity: integer("parity"),
  previousScreeningResult: text("previous_screening_result"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  campaignCode: text("campaign_code").notNull().unique(),
  organizationName: text("organization_name"),
  region: text("region"),
  country: text("country"),
  status: text("status", { enum: ["draft", "active", "paused", "completed"] }).notNull().default("draft"),
  isPublic: boolean("is_public").notNull().default(false),
  minRiskThreshold: text("min_risk_threshold").default("medium"),
  autoFlagEnabled: boolean("auto_flag_enabled").notNull().default(true),
  startDate: text("start_date"),
  endDate: text("end_date"),
  ownerId: text("owner_id").notNull().references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const slides = pgTable("slides", {
  id: serial("id").primaryKey(),
  slideCode: text("slide_code").notNull().unique(),
  patientId: integer("patient_id").notNull().references(() => patients.id),
  capturedBy: text("captured_by").notNull().references(() => user.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  imagePath: text("image_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  imageFormat: text("image_format").default("jpeg"),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
  fileSizeBytes: integer("file_size_bytes"),
  microscopeType: text("microscope_type"),
  magnification: text("magnification"),
  stainType: text("stain_type").default("Papanicolaou"),
  captureDevice: text("capture_device"),
  status: text("status", {
    enum: ["pending_inference", "inference_complete", "flagged_for_review", "under_review", "review_complete", "archived"],
  }).notNull().default("pending_inference"),
  riskLevel: text("risk_level", { enum: ["low", "medium", "high", "critical"] }),
  confidenceScore: real("confidence_score"),
  aiClassification: text("ai_classification"),
  aiPredictions: text("ai_predictions"),
  inferenceTimeMs: integer("inference_time_ms"),
  modelVersion: text("model_version"),
  roiData: text("roi_data"),
  capturedAt: timestamp("captured_at").defaultNow(),
  inferenceCompletedAt: timestamp("inference_completed_at"),
  uploadedAt: timestamp("uploaded_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  slideId: integer("slide_id").notNull().references(() => slides.id),
  pathologistId: text("pathologist_id").notNull().references(() => user.id),
  classification: text("classification").notNull(),
  decision: text("decision", {
    enum: ["agree_with_ai", "disagree_upgrade", "disagree_downgrade", "inconclusive"],
  }).notNull(),
  confidence: text("confidence"),
  notes: text("notes"),
  recommendedAction: text("recommended_action"),
  isUrgent: boolean("is_urgent").notNull().default(false),
  reviewDurationSeconds: integer("review_duration_seconds"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at").defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const campaignMembers = pgTable("campaign_members", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull().references(() => campaigns.id),
  userId: text("user_id").notNull().references(() => user.id),
  role: text("role", { enum: ["owner", "admin", "pathologist", "technician"] }).notNull().default("pathologist"),
  invitationStatus: text("invitation_status", { enum: ["pending", "accepted", "declined", "expired"] }).default("pending"),
  invitedBy: text("invited_by").references(() => user.id),
  invitationToken: text("invitation_token").unique(),
  invitationSentAt: timestamp("invitation_sent_at"),
  invitationExpiresAt: timestamp("invitation_expires_at"),
  casesReviewed: integer("cases_reviewed").default(0),
  lastActiveAt: timestamp("last_active_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deviceTokens = pgTable("device_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  token: text("token").notNull().unique(),
  deviceType: text("device_type").default("android"),
  deviceName: text("device_name"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  slideId: integer("slide_id").references(() => slides.id),
  type: text("type", {
    enum: ["flag_for_review", "case_assigned", "review_completed", "invitation", "campaign_update", "system_alert"],
  }).notNull(),
  status: text("status", { enum: ["unread", "read", "archived"] }).notNull().default("unread"),
  title: text("title").notNull(),
  message: text("message").notNull(),
  metadata: text("metadata"),
  priority: text("priority").default("normal"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  readAt: timestamp("read_at"),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
  slides: many(slides, { relationName: "capturedBy" }),
  reviews: many(reviews),
  ownedCampaigns: many(campaigns),
  campaignMemberships: many(campaignMembers),
  notifications: many(notifications),
  deviceTokens: many(deviceTokens),
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  slides: many(slides),
}));

export const slidesRelations = relations(slides, ({ one, many }) => ({
  patient: one(patients, { fields: [slides.patientId], references: [patients.id] }),
  capturedByUser: one(user, { fields: [slides.capturedBy], references: [user.id], relationName: "capturedBy" }),
  campaign: one(campaigns, { fields: [slides.campaignId], references: [campaigns.id] }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  slide: one(slides, { fields: [reviews.slideId], references: [slides.id] }),
  pathologist: one(user, { fields: [reviews.pathologistId], references: [user.id] }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  owner: one(user, { fields: [campaigns.ownerId], references: [user.id] }),
  members: many(campaignMembers),
  slides: many(slides),
}));

export const campaignMembersRelations = relations(campaignMembers, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignMembers.campaignId], references: [campaigns.id] }),
  user: one(user, { fields: [campaignMembers.userId], references: [user.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, { fields: [notifications.userId], references: [user.id] }),
  campaign: one(campaigns, { fields: [notifications.campaignId], references: [campaigns.id] }),
  slide: one(slides, { fields: [notifications.slideId], references: [slides.id] }),
}));

export const deviceTokensRelations = relations(deviceTokens, ({ one }) => ({
  user: one(user, { fields: [deviceTokens.userId], references: [user.id] }),
}));
