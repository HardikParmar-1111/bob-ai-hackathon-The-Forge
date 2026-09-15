import { db, protocolRules, deviations, trialSites, type PatientRecord, type ProtocolRule, type Deviation } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  triggered: boolean;
  severity: "MAJOR" | "MINOR" | "ADMINISTRATIVE";
  reason: string;
}

/**
 * Evaluates a patient record against clinical protocol rules.
 * Automatically persists deviations to PostgreSQL and updates site risk scores.
 *
 * @param record The newly logged PatientRecord
 * @param existingRules Optional pre-fetched rules list (defaults to all rules from DB)
 * @returns Array of created Deviation records
 */
export async function evaluatePatientRecord(
  record: PatientRecord,
  existingRules?: ProtocolRule[],
): Promise<Deviation[]> {
  logger.info({ recordId: record.id, subjectId: record.subjectId }, "Starting protocol rule evaluation for patient record");

  // Fetch active rules if not provided
  const rules = existingRules ?? (await db.select().from(protocolRules));

  if (!rules || rules.length === 0) {
    logger.warn("No active protocol rules found for evaluation");
    return [];
  }

  const scheduledTime = new Date(record.scheduledDate).getTime();
  const actualTime = new Date(record.actualDate).getTime();
  const windowDiffHours = Math.abs(actualTime - scheduledTime) / (1000 * 60 * 60);

  const rawMeds = (record.medicationsLogged as string[] | null) || [];
  const normalizedLoggedMeds: string[] = rawMeds.map((m: string) =>
    m.trim().toLowerCase(),
  );

  const triggeredViolations: Array<{
    rule: ProtocolRule;
    severity: "MAJOR" | "MINOR" | "ADMINISTRATIVE";
    reason: string;
  }> = [];

  for (const rule of rules) {
    // 1. Visit Window Check
    if (rule.maxWindowHours > 0 && windowDiffHours > rule.maxWindowHours) {
      const isMajor = windowDiffHours > rule.maxWindowHours * 2;
      triggeredViolations.push({
        rule,
        severity: isMajor ? "MAJOR" : "MINOR",
        reason: `Visit completed ${windowDiffHours.toFixed(1)}h from scheduled time, exceeding max window of ${rule.maxWindowHours}h.`,
      });
    }

    // 2. Prohibited Concomitant Medication Check
    const rawForbidden = (rule.forbiddenMedications as string[] | null) || [];
    const forbiddenMeds: string[] = rawForbidden.map((m: string) =>
      m.trim().toLowerCase(),
    );

    const detectedForbidden = normalizedLoggedMeds.filter((logged: string) =>
      forbiddenMeds.includes(logged),
    );

    if (detectedForbidden.length > 0) {
      triggeredViolations.push({
        rule,
        severity: "MAJOR",
        reason: `Prohibited concomitant medication(s) detected: ${detectedForbidden.join(", ")}. Violates GCP safety protocol.`,
      });
    }
  }

  if (triggeredViolations.length === 0) {
    logger.info({ recordId: record.id }, "Patient record passed all protocol rule evaluations");
    return [];
  }

  const createdDeviations: Deviation[] = [];
  let totalScoreDeduction = 0;

  for (const violation of triggeredViolations) {
    logger.warn(
      {
        siteId: record.siteId,
        recordId: record.id,
        ruleId: violation.rule.id,
        severity: violation.severity,
        reason: violation.reason,
      },
      "Protocol deviation flagged",
    );

    // Insert deviation into DB
    const [newDeviation] = await db
      .insert(deviations)
      .values({
        siteId: record.siteId,
        patientRecordId: record.id,
        ruleId: violation.rule.id,
        gcpSeverity: violation.severity,
        status: "OPEN",
        aiCapaReport: null,
      })
      .returning();

    if (newDeviation) {
      createdDeviations.push(newDeviation);
    }

    // Calculate score deduction: 15 for MAJOR, 5 for MINOR, 2 for ADMINISTRATIVE
    const deduction =
      violation.severity === "MAJOR" ? 15 : violation.severity === "MINOR" ? 5 : 2;
    totalScoreDeduction += deduction;
  }

  // Deduct points from the trial_sites risk_score
  if (totalScoreDeduction > 0) {
    const [currentSite] = await db
      .select()
      .from(trialSites)
      .where(eq(trialSites.id, record.siteId))
      .limit(1);

    if (currentSite) {
      const updatedScore = Math.max(0, currentSite.riskScore - totalScoreDeduction);
      await db
        .update(trialSites)
        .set({
          riskScore: updatedScore,
          updatedAt: new Date(),
        })
        .where(eq(trialSites.id, record.siteId));

      logger.info(
        {
          siteId: record.siteId,
          previousScore: currentSite.riskScore,
          updatedScore,
          deducted: totalScoreDeduction,
        },
        "Updated trial site risk score following deviation detection",
      );
    }
  }

  return createdDeviations;
}
