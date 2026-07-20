import { Hono } from "hono";
import { createDb } from "@cervical-lens/db";
import { campaigns, campaignMembers, slides, user } from "@cervical-lens/db/schema";
import { eq, like, or, desc, and } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { config } from "../config.js";

const db = createDb(config.database.url);
export const campaignRoutes = new Hono();
campaignRoutes.use("*", authMiddleware);

// POST / - Create Campaign
campaignRoutes.post("/", async (c) => {
  const userId = c.get("userId");
  let body = {};
  try {
    body = await c.req.json();
  } catch {
    // Empty body is allowed
  }

  const name = (body as any).name || `Outreach Drive - ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
  const description = (body as any).description || "Community screening outreach campaign.";
  const campaignCode = (body as any).campaign_code || `CAMP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const organizationName = (body as any).organization_name || "Healthcare Outreach";
  const region = (body as any).region || "Default Region";
  const country = (body as any).country || "Nigeria";
  const status = (body as any).status || "draft";
  const isPublic = (body as any).is_public ?? false;
  const minRiskThreshold = (body as any).min_risk_threshold || "medium";
  const autoFlagEnabled = (body as any).auto_flag_enabled ?? true;
  const startDate = (body as any).start_date || new Date().toISOString().split('T')[0];
  const endDate = (body as any).end_date || null;

  // Insert Campaign
  const [campaign] = await db
    .insert(campaigns)
    .values({
      name,
      description,
      campaignCode,
      organizationName,
      region,
      country,
      status: status as "draft" | "active" | "paused" | "completed",
      isPublic,
      minRiskThreshold,
      autoFlagEnabled,
      startDate,
      endDate,
      ownerId: userId,
    })
    .returning();

  // Insert Owner as Campaign Member
  await db.insert(campaignMembers).values({
    campaignId: campaign.id,
    userId: userId,
    role: "owner",
    invitationStatus: "accepted",
  });

  return c.json(
    {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      region: campaign.region,
      status: campaign.status,
      campaign_code: campaign.campaignCode,
      created_at: campaign.createdAt,
    },
    201
  );
});

// GET / - List Campaigns
campaignRoutes.get("/", async (c) => {
  const userId = c.get("userId");
  
  // Find all campaigns owned or participated by user
  const userCampaigns = await db
    .select({
      campaign: campaigns,
    })
    .from(campaigns)
    .leftJoin(campaignMembers, eq(campaigns.id, campaignMembers.campaignId))
    .where(
      or(
        eq(campaigns.ownerId, userId),
        eq(campaignMembers.userId, userId),
        eq(campaigns.isPublic, true)
      )
    )
    .orderBy(desc(campaigns.createdAt));

  // Deduplicate
  const dedupedMap = new Map();
  for (const r of userCampaigns) {
    dedupedMap.set(r.campaign.id, r.campaign);
  }
  const list = Array.from(dedupedMap.values());

  return c.json({
    campaigns: list.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      region: c.region,
      status: c.status,
      campaign_code: c.campaignCode,
      created_at: c.createdAt,
    })),
    total: list.length,
    page: 1,
    per_page: 100,
  });
});

// GET /:id - Get Campaign Details
campaignRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id))
    .limit(1);

  if (!campaign) {
    return c.json({ detail: "Campaign not found" }, 404);
  }

  return c.json({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    campaign_code: campaign.campaignCode,
    organization_name: campaign.organizationName,
    region: campaign.region,
    country: campaign.country,
    status: campaign.status,
    is_public: campaign.isPublic,
    min_risk_threshold: campaign.minRiskThreshold,
    auto_flag_enabled: campaign.autoFlagEnabled,
    start_date: campaign.startDate,
    end_date: campaign.endDate,
    created_at: campaign.createdAt,
  });
});

// GET /:id/stats - Get Campaign Stats
campaignRoutes.get("/:id/stats", async (c) => {
  const id = Number(c.req.param("id"));
  
  const campaignSlides = await db
    .select()
    .from(slides)
    .where(eq(slides.campaignId, id));

  const total_slides = campaignSlides.length;
  const pending_review = campaignSlides.filter((s) => s.status === "pending_inference" || s.status === "flagged_for_review" || s.status === "under_review").length;
  const under_review = campaignSlides.filter((s) => s.status === "under_review").length;
  const completed = campaignSlides.filter((s) => s.status === "review_complete").length;
  const flagged_count = campaignSlides.filter((s) => s.status === "flagged_for_review").length;

  const members = await db
    .select()
    .from(campaignMembers)
    .where(eq(campaignMembers.campaignId, id));

  const member_count = members.length;
  const pathologist_count = members.filter((m) => m.role === "pathologist" || m.role === "owner").length;

  return c.json({
    total_slides,
    pending_review,
    under_review,
    completed,
    flagged_count,
    member_count,
    pathologist_count,
  });
});

// PATCH /:id - Update Campaign
campaignRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  const userId = c.get("userId");

  // Check if owner or admin member
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.id, id))
    .limit(1);

  if (!campaign) {
    return c.json({ detail: "Campaign not found" }, 404);
  }

  const [membership] = await db
    .select()
    .from(campaignMembers)
    .where(
      and(
        eq(campaignMembers.campaignId, id),
        eq(campaignMembers.userId, userId)
      )
    )
    .limit(1);

  const canEdit = campaign.ownerId === userId || (membership && (membership.role === "admin" || membership.role === "owner"));
  if (!canEdit) {
    return c.json({ detail: "Permission denied" }, 403);
  }

  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.organization_name !== undefined) updates.organizationName = body.organization_name;
  if (body.region !== undefined) updates.region = body.region;
  if (body.country !== undefined) updates.country = body.country;
  if (body.status !== undefined) updates.status = body.status;
  if (body.is_public !== undefined) updates.isPublic = body.is_public;
  if (body.min_risk_threshold !== undefined) updates.minRiskThreshold = body.min_risk_threshold;
  if (body.auto_flag_enabled !== undefined) updates.autoFlagEnabled = body.auto_flag_enabled;
  if (body.start_date !== undefined) updates.startDate = body.start_date;
  if (body.end_date !== undefined) updates.endDate = body.end_date;
  updates.updatedAt = new Date();

  const [updated] = await db
    .update(campaigns)
    .set(updates)
    .where(eq(campaigns.id, id))
    .returning();

  return c.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    region: updated.region,
    status: updated.status,
  });
});

// POST /:id/activate - Activate Campaign
campaignRoutes.post("/:id/activate", async (c) => {
  const id = Number(c.req.param("id"));
  const [updated] = await db
    .update(campaigns)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(campaigns.id, id))
    .returning();

  if (!updated) {
    return c.json({ detail: "Campaign not found" }, 404);
  }

  return c.json({ id: updated.id, status: updated.status });
});

// POST /:id/invite - Invite Member
campaignRoutes.post("/:id/invite", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();
  
  const [invited] = await db
    .select()
    .from(user)
    .where(eq(user.email, body.email))
    .limit(1);

  if (!invited) {
    return c.json({ detail: "User with this email not registered" }, 404);
  }

  const [existingMember] = await db
    .select()
    .from(campaignMembers)
    .where(
      and(
        eq(campaignMembers.campaignId, id),
        eq(campaignMembers.userId, invited.id)
      )
    )
    .limit(1);

  if (existingMember) {
    return c.json({ detail: "User is already a member or invited" }, 409);
  }

  const [member] = await db
    .insert(campaignMembers)
    .values({
      campaignId: id,
      userId: invited.id,
      role: body.role || "pathologist",
      invitationStatus: "pending",
      invitedBy: c.get("userId"),
      invitationToken: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      invitationSentAt: new Date(),
    })
    .returning();

  return c.json({
    id: member.id,
    email: invited.email,
    role: member.role,
    status: member.invitationStatus,
  });
});

// GET /:id/members - Get Members List
campaignRoutes.get("/:id/members", async (c) => {
  const id = Number(c.req.param("id"));
  
  const membersWithUsers = await db
    .select({
      id: campaignMembers.id,
      role: campaignMembers.role,
      status: campaignMembers.invitationStatus,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(campaignMembers)
    .innerJoin(user, eq(campaignMembers.userId, user.id))
    .where(eq(campaignMembers.campaignId, id));

  return c.json({
    members: membersWithUsers.map((m) => ({
      id: m.id,
      role: m.role,
      status: m.status,
      name: m.user.name,
      email: m.user.email,
    })),
    total: membersWithUsers.length,
  });
});

// POST /invitations/accept - Accept Invitation
campaignRoutes.post("/invitations/accept", async (c) => {
  const body = await c.req.json();
  
  const [updated] = await db
    .update(campaignMembers)
    .set({ invitationStatus: "accepted", updatedAt: new Date() })
    .where(eq(campaignMembers.invitationToken, body.token))
    .returning();

  if (!updated) {
    return c.json({ detail: "Invalid or expired invitation token" }, 404);
  }

  return c.json({ id: updated.id, status: updated.status });
});

// POST /:id/leave - Leave Campaign
campaignRoutes.post("/:id/leave", async (c) => {
  const id = Number(c.req.param("id"));
  const userId = c.get("userId");

  await db
    .delete(campaignMembers)
    .where(
      and(
        eq(campaignMembers.campaignId, id),
        eq(campaignMembers.userId, userId)
      )
    );

  return c.json({ status: "success" });
});
