import { Router, type Request, type Response } from "express";
import { CreatePatientRecordSchema } from "@workspace/api-zod";
import { db, patientRecords, trialSites } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireRole } from "../middlewares/auth";
import { evaluatePatientRecord } from "../services/ruleEngine";
import { logger } from "../lib/logger";

const router = Router();

/**
 * POST /api/records
 * Role: SITE_ADMIN
 * Receives patient visit data, persists to patient_records, and triggers rule engine.
 */
router.post(
  "/records",
  requireRole(["SITE_ADMIN"]),
  async (req: Request, res: Response): Promise<void> => {
    // 1. Validate payload using Zod
    const parseResult = CreatePatientRecordSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed",
        issues: parseResult.error.flatten(),
      });
      return;
    }

    const { site_id, subject_id, scheduled_date, actual_date, medications_logged } =
      parseResult.data;

    try {
      // 2. Validate that site exists
      const [site] = await db
        .select()
        .from(trialSites)
        .where(eq(trialSites.id, site_id))
        .limit(1);

      if (!site) {
        res.status(404).json({
          error: "Not Found",
          message: `Trial site with ID '${site_id}' does not exist.`,
        });
        return;
      }

      // 3. Insert patient record
      const [createdRecord] = await db
        .insert(patientRecords)
        .values({
          siteId: site_id,
          subjectId: subject_id,
          scheduledDate: new Date(scheduled_date),
          actualDate: new Date(actual_date),
          medicationsLogged: medications_logged,
        })
        .returning();

      logger.info(
        { recordId: createdRecord.id, siteId: site_id, subjectId: subject_id },
        "Patient record successfully persisted",
      );

      // 4. Instantly evaluate against protocol rules
      const triggeredDeviations = await evaluatePatientRecord(createdRecord);

      res.status(201).json({
        message: "Patient record created and evaluated successfully",
        record: createdRecord,
        deviationsTriggered: triggeredDeviations.length,
        deviations: triggeredDeviations,
      });
    } catch (err: any) {
      logger.error({ err }, "Failed to create patient record");
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to persist and evaluate patient record",
      });
    }
  },
);

export default router;
