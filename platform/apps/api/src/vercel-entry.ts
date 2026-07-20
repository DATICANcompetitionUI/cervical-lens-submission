import { handle } from "@hono/node-server/vercel";

/**
 * Vercel serverless entrypoint source. Bundled to api/index.mjs by esbuild.
 *
 * Uses `hono/vercel`'s `handle` to convert Hono to a Vercel-compatible
 * request handler, which handles request body streams correctly in Vercel's
 * serverless environment and avoids hangs.
 */
export const config = { runtime: "nodejs" };

let handler: any = null;

async function bootstrap(req: any, res: any) {
  if (!handler) {
    const { app } = await import("./app.js");
    handler = handle(app);
  }
  const originalPath = req.headers["x-matched-path"];
  if (typeof originalPath === "string" && originalPath.startsWith("/")) {
    const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    req.url = originalPath + query;
  }
  return handler(req, res);
}

export default (req: any, res: any) => {
  const originalPath = req.headers["x-matched-path"];
  const currentPath = typeof originalPath === "string" && originalPath.startsWith("/") ? originalPath : req.url;

  // Raw health check to test env vars before loading main app code
  if (currentPath === "/health" || currentPath?.endsWith("/health")) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    
    let dbInfo = null;
    if (process.env.DATABASE_URL) {
      try {
        const u = new URL(process.env.DATABASE_URL);
        dbInfo = {
          host: u.hostname,
          user: u.username,
          passwordLength: u.password.length,
          passwordStart: u.password ? u.password.substring(0, 3) + "..." : "",
        };
      } catch (e) {
        dbInfo = { error: String(e) };
      }
    }

    res.end(JSON.stringify({
      status: "ok",
      database_url: process.env.DATABASE_URL ? "present" : "missing",
      database_url_info: dbInfo,
      better_auth_secret: process.env.BETTER_AUTH_SECRET ? "present" : "missing",
      better_auth_url: process.env.BETTER_AUTH_URL ? "present" : "missing",
      node_version: process.version,
    }));
    return;
  }

  // Execute bootstrap and handle any rejected promises safely
  bootstrap(req, res).catch((err: any) => {
    console.error("[vercel-entry] handler fatal error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: String(err), stack: err?.stack }));
    }
  });
};
