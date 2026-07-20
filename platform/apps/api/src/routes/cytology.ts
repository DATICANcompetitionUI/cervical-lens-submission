import { Hono } from "hono";
import { predictCytology, cytologyModelInfo } from "../ml/cytology.js";

/**
 * Cervical cytology screening — ONNX model served in TypeScript.
 * Same artifact the mobile app runs on-device; here it runs server-side for the
 * web console. Accepts a multipart image upload or a base64 JSON payload.
 */
export const cytologyRoutes = new Hono();

cytologyRoutes.get("/info", (c) => c.json(cytologyModelInfo()));

cytologyRoutes.post("/screen", async (c) => {
  try {
    let buf: Buffer | null = null;

    const contentType = c.req.header("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const body = await c.req.parseBody();
      const file = body["image"];
      if (file instanceof File) {
        buf = Buffer.from(await file.arrayBuffer());
      }
    } else {
      const json = (await c.req.json()) as { imageBase64?: string };
      if (json.imageBase64) {
        const b64 = json.imageBase64.replace(/^data:image\/\w+;base64,/, "");
        buf = Buffer.from(b64, "base64");
      }
    }

    if (!buf || buf.length === 0) {
      return c.json(
        { error: "Provide an image (multipart 'image' or JSON 'imageBase64')" },
        400,
      );
    }
    return c.json(await predictCytology(buf));
  } catch (e) {
    return c.json({ error: `cytology screening failed: ${String(e)}` }, 400);
  }
});
