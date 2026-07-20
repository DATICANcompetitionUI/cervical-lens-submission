import { Hono } from "hono";
import { createDb } from "@cervical-lens/db";
import { reviews, slides } from "@cervical-lens/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { authMiddleware, requireRole } from "../middleware/auth.js";
import { config } from "../config.js";

const db = createDb(config.database.url);
export const reviewRoutes = new Hono();
reviewRoutes.use("*", authMiddleware);

// POST / - Create / Submit Pathologist Review
reviewRoutes.post("/", requireRole("pathologist"), async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  const slideId = Number(body.slide_id);
  const classification = body.classification as string;
  const decision = body.decision as "agree_with_ai" | "disagree_upgrade" | "disagree_downgrade" | "inconclusive";
  const confidence = body.confidence as string | undefined;
  const notes = body.notes as string | undefined;
  const recommendedAction = body.recommended_action as string | undefined;
  const isUrgent = !!body.is_urgent;
  const reviewDurationSeconds = body.review_duration_seconds ? Number(body.review_duration_seconds) : null;

  if (!slideId || !classification || !decision) {
    return c.json({ detail: "Provide slide_id, classification, and decision" }, 400);
  }

  // Verify slide exists
  const [slide] = await db
    .select()
    .from(slides)
    .where(eq(slides.id, slideId))
    .limit(1);

  if (!slide) {
    return c.json({ detail: "Slide not found" }, 404);
  }

  // Insert review
  const [review] = await db
    .insert(reviews)
    .values({
      slideId,
      pathologistId: userId,
      classification,
      decision,
      confidence,
      notes,
      recommendedAction,
      isUrgent,
      reviewDurationSeconds,
      completedAt: new Date(),
    })
    .returning();

  // Update slide status to review_complete
  await db
    .update(slides)
    .set({
      status: "review_complete",
      updatedAt: new Date(),
    })
    .where(eq(slides.id, slideId));

  return c.json(review, 201);
});

// GET /slide/:id - Get Reviews for Slide
reviewRoutes.get("/slide/:id", async (c) => {
  const slideId = Number(c.req.param("id"));

  const results = await db
    .select()
    .from(reviews)
    .where(eq(reviews.slideId, slideId))
    .orderBy(desc(reviews.createdAt));

  return c.json(results);
});

// GET /my-reviews - Get Pathologist's Own Reviews
reviewRoutes.get("/my-reviews", requireRole("pathologist"), async (c) => {
  const userId = c.get("userId");

  const results = await db
    .select()
    .from(reviews)
    .where(eq(reviews.pathologistId, userId))
    .orderBy(desc(reviews.createdAt));

  return c.json(results);
});

// POST /:id/claim - Claim Slide for Review
reviewRoutes.post("/:id/claim", requireRole("pathologist"), async (c) => {
  const slideId = Number(c.req.param("id"));

  const [slide] = await db
    .select()
    .from(slides)
    .where(eq(slides.id, slideId))
    .limit(1);

  if (!slide) {
    return c.json({ detail: "Slide not found" }, 404);
  }

  // Set status to under_review
  const [updated] = await db
    .update(slides)
    .set({
      status: "under_review",
      updatedAt: new Date(),
    })
    .where(eq(slides.id, slideId))
    .returning();

  return c.json({
    id: updated.id,
    status: updated.status,
  });
});
