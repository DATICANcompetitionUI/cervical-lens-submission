import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth.js";
import { config } from "./config.js";
import { patientRoutes } from "./routes/patients.js";
import { slideRoutes } from "./routes/slides.js";
import { reviewRoutes } from "./routes/reviews.js";
import { campaignRoutes } from "./routes/campaigns.js";
import { notificationRoutes } from "./routes/notifications.js";
import { deviceTokenRoutes } from "./routes/device-tokens.js";
import { riskRoutes } from "./routes/risk.js";
import { cytologyRoutes } from "./routes/cytology.js";

/**
 * The Hono app itself, decoupled from any particular runtime entrypoint.
 * - Local dev: src/index.ts (Bun's `export default { port, fetch }`)
 * - Vercel: api/index.ts (hono/vercel's `handle(app)`)
 *
 * Schema is managed by drizzle-kit (push/migrate) against Neon Postgres —
 * no runtime table creation here.
 */
export const app = new Hono();

app.onError((err, c) => {
  console.error("Hono error:", err);
  return c.json({ error: err.message, stack: err.stack }, 500);
});

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return "";
      if (
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".hallelx2.com") ||
        origin === "https://hallelx2.com" ||
        origin.endsWith(".vercel.app") ||
        /^https?:\/\/(10\.\d+|192\.168\.\d+|172\.(1[6-9]|2\d|3[01])\.)\d+/.test(origin)
      ) {
        return origin;
      }
      return "";
    },
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});


const api = new Hono();
api.route("/patients", patientRoutes);
api.route("/slides", slideRoutes);
api.route("/reviews", reviewRoutes);
api.route("/campaigns", campaignRoutes);
api.route("/notifications", notificationRoutes);
api.route("/device-tokens", deviceTokenRoutes);
api.route("/risk", riskRoutes);
api.route("/cytology", cytologyRoutes);

app.route("/api/v1", api);

app.get("/health", (c) => c.json({ status: "ok" }));
