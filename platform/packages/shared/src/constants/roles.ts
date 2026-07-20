import type { UserRole } from "../types";

export const ROLE_LABELS: Record<UserRole, string> = {
  technician: "Clinic Technician",
  pathologist: "Pathologist",
  admin: "Administrator",
};
