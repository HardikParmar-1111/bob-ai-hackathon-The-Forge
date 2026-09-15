import { Router, type Request, type Response } from "express";
import { GenerateCapaRequestSchema } from "@workspace/api-zod";
import { db, deviations, trialSites, patientRecords, protocolRules } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireRole } from "../middlewares/auth";
import { generateMockCAPA, type DeviationContext } from "../services/aiCapaService";
import { logger } from "../lib/logger";

const router = Router();

/**
 * POST /api/capa/generate
 * Role: RISK_MANAGER
 * Generates an AI-powered GCP CAPA report for a specific deviation and saves it.
 */
router.post(
  "/capa/generate",
  requireRole(["RISK_MANAGER"]),
  async (req: Request, res: Response): Promise<void> => {
    // 1. Validate request payload using Zod
    const parseResult = GenerateCapaRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: "Validation failed",
        issues: parseResult.error.flatten(),
      });
      return;
    }

    const { deviation_id } = parseResult.data;

    try {
      // 2. Fetch full deviation context with relational details
      const [deviationData] = await db
        .select({
          id: deviations.id,
          siteId: deviations.siteId,
          siteName: trialSites.siteName,
          subjectId: patientRecords.subjectId,
          scheduledDate: patientRecords.scheduledDate,
          actualDate: patientRecords.actualDate,
          medicationsLogged: patientRecords.medicationsLogged,
          ruleId: deviations.ruleId,
          ruleName: protocolRules.ruleName,
          ruleDescription: protocolRules.description,
          gcpSeverity: deviations.gcpSeverity,
          status: deviations.status,
          existingCapa: deviations.aiCapaReport,
        })
        .from(deviations)
        .innerJoin(trialSites, eq(deviations.siteId, trialSites.id))
        .innerJoin(patientRecords, eq(deviations.patientRecordId, patientRecords.id))
        .innerJoin(protocolRules, eq(deviations.ruleId, protocolRules.id))
        .where(eq(deviations.id, deviation_id))
        .limit(1);

      if (!deviationData) {
        res.status(404).json({
          error: "Not Found",
          message: `Deviation with ID '${deviation_id}' does not exist.`,
        });
        return;
      }

      // 3. Assemble context for AI CAPA generator
      const context: DeviationContext = {
        deviationId: deviationData.id,
        siteId: deviationData.siteId,
        siteName: deviationData.siteName,
        subjectId: deviationData.subjectId,
        ruleName: deviationData.ruleName,
        ruleDescription: deviationData.ruleDescription,
        scheduledDate: deviationData.scheduledDate,
        actualDate: deviationData.actualDate,
        medicationsLogged: deviationData.medicationsLogged,
        gcpSeverity: deviationData.gcpSeverity,
      };

      // 4. Generate AI CAPA report via swappable adapter
      const capaReport = await generateMockCAPA(context);

      // 5. Persist the generated CAPA report onto the deviation record
      const [updatedDeviation] = await db
        .update(deviations)
        .set({
          aiCapaReport: JSON.stringify(capaReport, null, 2),
          updatedAt: new Date(),
        })
        .where(eq(deviations.id, deviation_id))
        .returning();

      logger.info(
        { deviationId: deviation_id, model: capaReport.model },
        "AI CAPA report successfully generated and saved",
      );

      res.status(200).json({
        message: "CAPA report successfully generated and attached to deviation",
        deviation_id,
        capa: capaReport,
        saved: true,
        deviation: updatedDeviation,
      });
    } catch (err: any) {
      logger.error({ err, deviation_id }, "Error generating AI CAPA report");
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to generate CAPA report",
      });
    }
  },
);

export default router;
