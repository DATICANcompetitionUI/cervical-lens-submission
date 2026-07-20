import { Hono } from "hono";
import { createDb } from "@cervical-lens/db";
import { patients } from "@cervical-lens/db/schema";
import { eq, like, or, desc } from "drizzle-orm";
import { authMiddleware } from "../middleware/auth.js";
import { config } from "../config.js";

const db = createDb(config.database.url);
export const patientRoutes = new Hono();

patientRoutes.use("*", authMiddleware);

patientRoutes.post("/", async (c) => {
  const body = await c.req.json();

  const [existing] = await db
    .select()
    .from(patients)
    .where(eq(patients.patientCode, body.patient_code))
    .limit(1);

  if (existing) {
    return c.json({ detail: "Patient with this code already exists" }, 409);
  }

  const [patient] = await db
    .insert(patients)
    .values({
      patientCode: body.patient_code,
      age: body.age,
      dateOfBirth: body.date_of_birth,
      region: body.region,
      clinicName: body.clinic_name,
      hpvStatus: body.hpv_status,
      parity: body.parity,
      previousScreeningResult: body.previous_screening_result,
      notes: body.notes,
    })
    .returning();

  return c.json(
    {
      id: patient.id,
      patient_code: patient.patientCode,
      age: patient.age,
      date_of_birth: patient.dateOfBirth,
      region: patient.region,
      clinic_name: patient.clinicName,
      hpv_status: patient.hpvStatus,
      parity: patient.parity,
      previous_screening_result: patient.previousScreeningResult,
      notes: patient.notes,
      created_at: patient.createdAt,
      updated_at: patient.updatedAt,
    },
    201
  );
});

patientRoutes.get("/", async (c) => {
  const page = Number(c.req.query("page")) || 1;
  const perPage = Math.min(Number(c.req.query("per_page")) || 20, 100);
  const search = c.req.query("search");

  let query = db.select().from(patients).$dynamic();

  if (search) {
    query = query.where(
      or(
        like(patients.patientCode, `%${search}%`),
        like(patients.region, `%${search}%`)
      )
    );
  }

  const results = await query
    .orderBy(desc(patients.createdAt))
    .offset((page - 1) * perPage)
    .limit(perPage);

  return c.json(
    results.map((p) => ({
      id: p.id,
      patient_code: p.patientCode,
      age: p.age,
      date_of_birth: p.dateOfBirth,
      region: p.region,
      clinic_name: p.clinicName,
      hpv_status: p.hpvStatus,
      parity: p.parity,
      previous_screening_result: p.previousScreeningResult,
      notes: p.notes,
      created_at: p.createdAt,
      updated_at: p.updatedAt,
    }))
  );
});

patientRoutes.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, id))
    .limit(1);

  if (!patient) {
    return c.json({ detail: "Patient not found" }, 404);
  }

  return c.json({
    id: patient.id,
    patient_code: patient.patientCode,
    age: patient.age,
    date_of_birth: patient.dateOfBirth,
    region: patient.region,
    clinic_name: patient.clinicName,
    hpv_status: patient.hpvStatus,
    parity: patient.parity,
    previous_screening_result: patient.previousScreeningResult,
    notes: patient.notes,
    created_at: patient.createdAt,
    updated_at: patient.updatedAt,
  });
});

patientRoutes.patch("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  const updates: Record<string, unknown> = {};
  if (body.age !== undefined) updates.age = body.age;
  if (body.date_of_birth !== undefined) updates.dateOfBirth = body.date_of_birth;
  if (body.region !== undefined) updates.region = body.region;
  if (body.clinic_name !== undefined) updates.clinicName = body.clinic_name;
  if (body.hpv_status !== undefined) updates.hpvStatus = body.hpv_status;
  if (body.parity !== undefined) updates.parity = body.parity;
  if (body.previous_screening_result !== undefined) updates.previousScreeningResult = body.previous_screening_result;
  if (body.notes !== undefined) updates.notes = body.notes;
  updates.updatedAt = new Date().toISOString();

  const [patient] = await db
    .update(patients)
    .set(updates)
    .where(eq(patients.id, id))
    .returning();

  if (!patient) {
    return c.json({ detail: "Patient not found" }, 404);
  }

  return c.json({
    id: patient.id,
    patient_code: patient.patientCode,
    age: patient.age,
    date_of_birth: patient.dateOfBirth,
    region: patient.region,
    clinic_name: patient.clinicName,
    hpv_status: patient.hpvStatus,
    parity: patient.parity,
    previous_screening_result: patient.previousScreeningResult,
    notes: patient.notes,
    created_at: patient.createdAt,
    updated_at: patient.updatedAt,
  });
});
