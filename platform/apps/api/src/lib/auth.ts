import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins/bearer";
import { createDb } from "@cervical-lens/db";
import * as schema from "@cervical-lens/db/schema";
import { config } from "../config.js";

const db = createDb(config.database.url);

/**
 * Better Auth server instance.
 *
 * - email/password auth, Postgres (Neon) via the Drizzle adapter.
 * - `bearer()` lets mobile (no cookie jar) authenticate with a plain
 *   `Authorization: Bearer <token>` header instead of cookies — the session
 *   token returned on sign-in/sign-up doubles as that bearer token.
 * - `additionalFields` on user persists our domain fields (role, clinic
 *   info) alongside Better Auth's own columns.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secret: config.auth.secret,
  baseURL: config.auth.url,
  trustedOrigins: config.cors.origins,
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "technician",
        input: true,
      },
      isActive: {
        type: "boolean",
        defaultValue: true,
        input: false,
      },
      licenseNumber: { type: "string", required: false, input: true },
      institution: { type: "string", required: false, input: true },
      specialization: { type: "string", required: false, input: true },
      clinicName: { type: "string", required: false, input: true },
      clinicRegion: { type: "string", required: false, input: true },
    },
  },
  plugins: [bearer()],
});

export type AuthUser = typeof auth.$Infer.Session.user;
