import { Hono } from "hono";
import { createDb } from "@cervical-lens/db";
import { slides, patients, user } from "@cervical-lens/db/schema";
import { eq, desc, and, or, like } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { config } from "../config.js";
import { uploadFile, downloadFile } from "../lib/storage.js";
import { predictCytology } from "../ml/cytology.js";

const db = createDb(config.database.url);
export const slideRoutes = new Hono();
slideRoutes.use("*", authMiddleware);

// GET /stats - Slides Stats Summary
slideRoutes.get("/stats", async (c) => {
  const allSlides = await db.select().from(slides);
  
  const total_slides = allSlides.length;
  const pending_inference = allSlides.filter((s) => s.status === "pending_inference").length;
  const flagged_for_review = allSlides.filter((s) => s.status === "flagged_for_review").length;
  const under_review = allSlides.filter((s) => s.status === "under_review").length;
  const review_complete = allSlides.filter((s) => s.status === "review_complete").length;
  const high_risk_count = allSlides.filter((s) => s.riskLevel === "high" || s.riskLevel === "critical").length;
  
  const validScores = allSlides.map((s) => s.confidenceScore).filter((score): score is number => typeof score === "number");
  const avg_confidence = validScores.length > 0 ? Number((validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(4)) : null;

  return c.json({
    total_slides,
    pending_inference,
    flagged_for_review,
    under_review,
    review_complete,
    high_risk_count,
    avg_confidence,
  });
});

// GET / - List Slides
slideRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const perPage = Math.min(Number(c.req.query("per_page")) || 20, 100);
  const status = c.req.query("status");
  const riskLevel = c.req.query("risk_level");
  const search = c.req.query("search");

  let query = db
    .select({
      id: slides.id,
      slide_code: slides.slideCode,
      image_path: slides.imagePath,
      thumbnail_path: slides.thumbnailPath,
      status: slides.status,
      risk_level: slides.riskLevel,
      confidence_score: slides.confidenceScore,
      ai_classification: slides.aiClassification,
      created_at: slides.createdAt,
      patient: {
        id: patients.id,
        patient_code: patients.patientCode,
        age: patients.age,
        region: patients.region,
      },
    })
    .from(slides)
    .innerJoin(patients, eq(slides.patientId, patients.id))
    .$dynamic();

  const conditions = [];
  if (status) {
    conditions.push(eq(slides.status, status as any));
  }
  if (riskLevel) {
    conditions.push(eq(slides.riskLevel, riskLevel as any));
  }
  if (search) {
    conditions.push(
      or(
        like(slides.slideCode, `%${search}%`),
        like(patients.patientCode, `%${search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const results = await query
    .orderBy(desc(slides.createdAt))
    .offset((page - 1) * perPage)
    .limit(perPage);

  return c.json({
    slides: results,
    total: results.length,
    page,
    per_page: perPage,
  });
});

// GET /:id - Get Slide Details
slideRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  
  const [result] = await db
    .select({
      id: slides.id,
      slide_code: slides.slideCode,
      patient_id: slides.patientId,
      campaign_id: slides.campaignId,
      image_path: slides.imagePath,
      thumbnail_path: slides.thumbnailPath,
      status: slides.status,
      risk_level: slides.riskLevel,
      confidence_score: slides.confidenceScore,
      ai_classification: slides.aiClassification,
      ai_predictions: slides.aiPredictions,
      inference_time_ms: slides.inferenceTimeMs,
      microscope_type: slides.microscopeType,
      magnification: slides.magnification,
      stain_type: slides.stainType,
      capture_device: slides.captureDevice,
      created_at: slides.createdAt,
      patient: {
        id: patients.id,
        patient_code: patients.patientCode,
        age: patients.age,
        region: patients.region,
        clinic_name: patients.clinicName,
        hpv_status: patients.hpvStatus,
        parity: patients.parity,
        previous_screening_result: patients.previousScreeningResult,
        notes: patients.notes,
      },
    })
    .from(slides)
    .innerJoin(patients, eq(slides.patientId, patients.id))
    .where(eq(slides.id, id))
    .limit(1);

  if (!result) {
    return c.json({ detail: "Slide not found" }, 404);
  }

  return c.json(result);
});

// POST /upload - Upload Slide Image
slideRoutes.post("/upload", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.parseBody();
  
  const slideCode = body["slide_code"] as string;
  const patientId = Number(body["patient_id"]);
  const campaignId = body["campaign_id"] ? Number(body["campaign_id"]) : null;
  const file = body["image"];

  if (!slideCode || !patientId || !(file instanceof File)) {
    return c.json({ detail: "Provide slide_code, patient_id, and image file" }, 400);
  }

  const [existing] = await db
    .select()
    .from(slides)
    .where(eq(slides.slideCode, slideCode))
    .limit(1);

  if (existing) {
    return c.json({ detail: "Slide with this code already exists" }, 409);
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `${slideCode}-${Date.now()}.${fileExt}`;
    
    // Upload image
    const { filePath, publicUrl } = await uploadFile(fileBuffer, fileName, file.type);

    const [slide] = await db
      .insert(slides)
      .values({
        slideCode,
        patientId,
        campaignId,
        capturedBy: userId,
        imagePath: publicUrl, // Save public URL for web UI
        thumbnailPath: publicUrl,
        imageFormat: fileExt,
        fileSizeBytes: fileBuffer.length,
        microscopeType: (body["microscope_type"] as string) || "Optical",
        magnification: (body["magnification"] as string) || "40x",
        stainType: (body["stain_type"] as string) || "Papanicolaou",
        captureDevice: (body["capture_device"] as string) || "Microscope Camera",
        status: "pending_inference",
      })
      .returning();

    return c.json(slide, 201);
  } catch (e) {
    console.error("Slide upload failed:", e);
    return c.json({ detail: `Upload failed: ${String(e)}` }, 500);
  }
});

// POST /:id/inference - Trigger AI Inference on Slide
slideRoutes.post("/:id/inference", async (c) => {
  const id = Number(c.req.param("id"));

  const [slide] = await db
    .select()
    .from(slides)
    .where(eq(slides.id, id))
    .limit(1);

  if (!slide) {
    return c.json({ detail: "Slide not found" }, 404);
  }

  try {
    const startTime = Date.now();
    let imageBuffer: Buffer;
    
    // Read the image path. If it starts with http, fetch it.
    if (slide.imagePath.startsWith("http")) {
      const res = await fetch(slide.imagePath);
      if (!res.ok) throw new Error("Failed to fetch image from remote URL");
      imageBuffer = Buffer.from(await res.arrayBuffer());
    } else {
      imageBuffer = await downloadFile(slide.imagePath);
    }

    // Call ML ONNX cytology model
    const prediction = await predictCytology(imageBuffer);
    const duration = Date.now() - startTime;

    // Map label/scores to DB model fields
    const aiClassification = prediction.label; // "NILM" | "Abnormal"
    const confidenceScore = prediction.abnormal_probability;
    const isAbnormal = aiClassification.toLowerCase() === "abnormal";
    
    const riskLevel = isAbnormal
      ? (confidenceScore > 0.8 ? "critical" : "high")
      : (confidenceScore < 0.25 ? "low" : "medium");

    const status = isAbnormal ? "flagged_for_review" : "inference_complete";

    const [updated] = await db
      .update(slides)
      .set({
        aiClassification,
        confidenceScore,
        aiPredictions: JSON.stringify(prediction.probabilities),
        riskLevel,
        status,
        inferenceTimeMs: duration,
        inferenceCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(slides.id, id))
      .returning();

    return c.json({
      slide_id: updated.id,
      status: updated.status,
      ai_classification: updated.aiClassification,
      confidence_score: updated.confidenceScore,
      risk_level: updated.riskLevel,
      inference_time_ms: updated.inferenceTimeMs,
    });
  } catch (e) {
    console.error("AI Inference failed:", e);
    return c.json({ detail: `Inference failed: ${String(e)}` }, 500);
  }
});

// POST /:id/analyze - Hybrid Triage Analysis
slideRoutes.post("/:id/analyze", async (c) => {
  // Simple alias to inference route for our dashboard
  return c.redirect(`/api/v1/slides/${c.req.param("id")}/inference`, 307);
});
