import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const UserRoleSchema = z.enum(["SITE_ADMIN", "RISK_MANAGER"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const GcpSeveritySchema = z.enum(["MAJOR", "MINOR", "ADMINISTRATIVE"]);
export type GcpSeverity = z.infer<typeof GcpSeveritySchema>;

export const DeviationStatusSchema = z.enum(["OPEN", "RESOLVED"]);
export type DeviationStatus = z.infer<typeof DeviationStatusSchema>;

// ---------------------------------------------------------------------------
// Patient Record Schemas
// ---------------------------------------------------------------------------
export const CreatePatientRecordSchema = z.object({
  site_id: z.string().uuid({ message: "site_id must be a valid UUID" }),
  subject_id: z.string().min(1, { message: "subject_id is required" }),
  scheduled_date: z
    .string()
    .datetime({ offset: true, message: "scheduled_date must be a valid ISO timestamp" })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/, "scheduled_date must be a valid date/timestamp")),
  actual_date: z
    .string()
    .datetime({ offset: true, message: "actual_date must be a valid ISO timestamp" })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/, "actual_date must be a valid date/timestamp")),
  medications_logged: z.array(z.string()).default([]),
});

export type CreatePatientRecordInput = z.infer<typeof CreatePatientRecordSchema>;

export const PatientRecordResponseSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  subject_id: z.string(),
  scheduled_date: z.string(),
  actual_date: z.string(),
  medications_logged: z.array(z.string()),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// Deviation Schemas
// ---------------------------------------------------------------------------
export const DeviationsQuerySchema = z.object({
  status: DeviationStatusSchema.optional().default("OPEN"),
  site_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export type DeviationsQueryInput = z.infer<typeof DeviationsQuerySchema>;

export const DeviationItemSchema = z.object({
  id: z.string().uuid(),
  site_id: z.string().uuid(),
  site_name: z.string(),
  subject_id: z.string(),
  patient_record_id: z.string().uuid(),
  rule_id: z.string().uuid(),
  rule_name: z.string(),
  rule_description: z.string(),
  gcp_severity: GcpSeveritySchema,
  ai_capa_report: z.string().nullable(),
  status: DeviationStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export type DeviationItem = z.infer<typeof DeviationItemSchema>;

// ---------------------------------------------------------------------------
// CAPA Generation Schemas
// ---------------------------------------------------------------------------
export const GenerateCapaRequestSchema = z.object({
  deviation_id: z.string().uuid({ message: "deviation_id must be a valid UUID" }),
});

export type GenerateCapaRequestInput = z.infer<typeof GenerateCapaRequestSchema>;

export const CapaReportSchema = z.object({
  "Root Cause": z.string(),
  "Preventive Action": z.string(),
  "Immediate Containment": z.string().optional(),
  "Regulatory Risk Assessment": z.string().optional(),
  generatedAt: z.string(),
  model: z.string(),
});

export type CapaReport = z.infer<typeof CapaReportSchema>;

export const CapaResponseSchema = z.object({
  deviation_id: z.string().uuid(),
  capa: CapaReportSchema,
  saved: z.boolean(),
});
