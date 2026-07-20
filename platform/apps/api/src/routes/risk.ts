import { Hono } from "hono";
import {
  predictGenomicsRisk,
  genomicsModelInfo,
  type GenomicFeatures,
} from "../ml/genomicsRisk.js";

/**
 * Genomic risk scoring — served in pure TypeScript from the exported Cox model.
 * (Imaging/cytology inference is wired separately in slides.ts.)
 */
export const riskRoutes = new Hono();

riskRoutes.get("/info", (c) => c.json(genomicsModelInfo()));

riskRoutes.post("/genomics", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Body must be JSON" }, 400);
  }
  // accept {features: {...}} or a bare feature map
  const features = (
    body && typeof body === "object" && "features" in body
      ? (body as { features: unknown }).features
      : body
  ) as GenomicFeatures;

  if (!features || typeof features !== "object") {
    return c.json({ error: "Provide genomic features as an object" }, 400);
  }
  return c.json(predictGenomicsRisk(features));
});
