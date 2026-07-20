import { z } from "zod";

export const patientCreateSchema = z.object({
  patient_code: z.string().min(1),
  age: z.number().int().positive().optional(),
  date_of_birth: z.string().optional(),
  region: z.string().optional(),
  clinic_name: z.string().optional(),
  hpv_status: z.enum(["positive", "negative", "unknown"]).optional(),
  parity: z.number().int().nonnegative().optional(),
  previous_screening_result: z.string().optional(),
  notes: z.string().optional(),
});

export const patientUpdateSchema = z.object({
  age: z.number().int().positive().optional(),
  date_of_birth: z.string().optional(),
  region: z.string().optional(),
  clinic_name: z.string().optional(),
  hpv_status: z.enum(["positive", "negative", "unknown"]).optional(),
  parity: z.number().int().nonnegative().optional(),
  previous_screening_result: z.string().optional(),
  notes: z.string().optional(),
});

export type PatientCreateInput = z.infer<typeof patientCreateSchema>;
export type PatientUpdateInput = z.infer<typeof patientUpdateSchema>;
