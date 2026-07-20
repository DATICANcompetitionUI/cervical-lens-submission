import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema.js";

/** Neon serverless (HTTP) driver — works in edge/serverless runtimes (Vercel). */
export function createDb(url: string) {
  const sql = neon(url);
  return drizzle(sql, { schema });
}

export type Database = ReturnType<typeof createDb>;
