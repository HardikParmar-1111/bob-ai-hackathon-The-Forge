import { Router, type Request, type Response } from "express";
import { DeviationsQuerySchema } from "@workspace/api-zod";
import { db, deviations, trialSites, patientRecords, protocolRules } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireRole } from "../middlewares/auth";
import { logger } from "../lib/logger";

const router = Router();

/**
 * GET /api/deviations
 * Role: RISK_MANAGER
 * Fetches joined list of deviations (including site name and subject ID), sorted newest first.
 */
router.get(
  "/deviations",
  requireRole(["RISK_MANAGER"]),
  async (req: Request, res: Response): Promise<void> => {
    // 1. Validate query parameters
    const queryResult = DeviationsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        issues: queryResult.error.flatten(),
      });
      return;
    }

    const { status, site_id, limit, offset } = queryResult.data;

    try {
      // Build conditions
      const conditions = [];
      if (status) {
        conditions.push(eq(deviations.status, status));
      }
      if (site_id) {
        conditions.push(eq(deviations.siteId, site_id));
      }

      // 2. Perform relational join query
      const results = await db
        .select({
          id: deviations.id,
          site_id: deviations.siteId,
          site_name: trialSites.siteName,
          site_location: trialSites.location,
          subject_id: patientRecords.subjectId,
          patient_record_id: deviations.patientRecordId,
          scheduled_date: patientRecords.scheduledDate,
          actual_date: patientRecords.actualDate,
          medications_logged: patientRecords.medicationsLogged,
          rule_id: deviations.ruleId,
          rule_name: protocolRules.ruleName,
          rule_description: protocolRules.description,
          max_window_hours: protocolRules.maxWindowHours,
          gcp_severity: deviations.gcpSeverity,
          ai_capa_report: deviations.aiCapaReport,
          status: deviations.status,
          created_at: deviations.createdAt,
          updated_at: deviations.updatedAt,
        })
        .from(deviations)
        .innerJoin(trialSites, eq(deviations.siteId, trialSites.id))
        .innerJoin(patientRecords, eq(deviations.patientRecordId, patientRecords.id))
        .innerJoin(protocolRules, eq(deviations.ruleId, protocolRules.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(deviations.createdAt))
        .limit(limit)
        .offset(offset);

      logger.info({ count: results.length, status }, "Fetched deviations list");

      res.status(200).json({
        deviations: results,
        meta: {
          count: results.length,
          limit,
          offset,
          statusFilter: status,
        },
      });
    } catch (err: any) {
      logger.error({ err }, "Failed to fetch deviations list");
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve deviations",
      });
    }
  },
);

export default router;
