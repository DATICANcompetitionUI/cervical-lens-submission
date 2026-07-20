import { Context, Next } from "hono";
import { auth } from "../lib/auth.js";

export async function authMiddleware(c: Context, next: Next) {
  const headers = new Headers();
  for (const [key, val] of Object.entries(c.req.header())) {
    if (val !== undefined) {
      headers.set(key, val);
    }
  }
  const session = await auth.api.getSession({ headers });

  if (!session) {
    return c.json({ detail: "Missing or invalid authorization" }, 401);
  }
  if (!session.user.isActive) {
    return c.json({ detail: "User not found or deactivated" }, 401);
  }

  c.set("user", session.user);
  c.set("userId", session.user.id);
  c.set("userRole", session.user.role);
  await next();
}

export function requireRole(...roles: string[]) {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole");
    if (!roles.includes(userRole) && userRole !== "admin") {
      return c.json({ detail: `Requires one of: ${roles.join(", ")}` }, 403);
    }
    await next();
  };
}
