import { z } from "zod";

export const userRoleSchema = z.enum(["technician", "pathologist", "admin"]);

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(1),
  role: userRoleSchema,
  license_number: z.string().optional(),
  institution: z.string().optional(),
  specialization: z.string().optional(),
  clinic_name: z.string().optional(),
  clinic_region: z.string().optional(),
});

export const userUpdateSchema = z.object({
  full_name: z.string().min(1).optional(),
  institution: z.string().optional(),
  specialization: z.string().optional(),
  clinic_name: z.string().optional(),
  clinic_region: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
