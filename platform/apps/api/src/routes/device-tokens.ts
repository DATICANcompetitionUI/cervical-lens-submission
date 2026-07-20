import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth.js";

export const deviceTokenRoutes = new Hono();
deviceTokenRoutes.use("*", authMiddleware);

deviceTokenRoutes.post("/register", async (c) => {
  return c.json({ message: "Token registered" });
});

deviceTokenRoutes.delete("/:token", async (c) => {
  return c.json({ message: "Token unregistered" });
});

deviceTokenRoutes.get("/my-tokens", async (c) => {
  return c.json([]);
});
