import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

export const notificationRoutes = new Hono();
notificationRoutes.use("*", authMiddleware);

notificationRoutes.get("/", async (c) => {
  return c.json({ notifications: [], total: 0, unread_count: 0, page: 1, per_page: 20 });
});

notificationRoutes.get("/stats", async (c) => {
  return c.json({ total: 0, unread: 0, urgent: 0, by_type: {} });
});

notificationRoutes.get("/urgent", async (c) => {
  return c.json([]);
});

notificationRoutes.get("/:id", async (c) => {
  return c.json({ detail: "Notification not found" }, 404);
});

notificationRoutes.patch("/:id", async (c) => {
  return c.json({ detail: "Update notification — connect DB" }, 501);
});

notificationRoutes.post("/mark-all-read", async (c) => {
  return c.json({ marked_count: 0 });
});

notificationRoutes.post("/:id/mark-read", async (c) => {
  return c.json({ detail: "Mark read — connect DB" }, 501);
});

notificationRoutes.delete("/:id", async (c) => {
  return c.body(null, 204);
});
