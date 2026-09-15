import type { CapaReport } from "@workspace/api-zod";
import { logger } from "../lib/logger";

export interface DeviationContext {
  deviationId: string;
  siteId: string;
  siteName: string;
  subjectId: string;
  ruleName: string;
  ruleDescription: string;
  scheduledDate: Date | string;
  actualDate: Date | string;
  medicationsLogged: string[];
  gcpSeverity: "MAJOR" | "MINOR" | "ADMINISTRATIVE";
}

/**
 * Swappable interface for AI-powered GCP CAPA generation.
 * Can be implemented by Mock, Gemini, IBM Bob, or Anthropic adapters.
 */
export interface AICapaGenerator {
  generateCAPA(context: DeviationContext): Promise<CapaReport>;
}

/**
 * Mock AI CAPA Generator adapter.
 * Produces structured, GCP ICH E6(R2)-compliant Root Cause and Preventive Actions
 * tailored to the deviation context.
 */
export class MockAICapaGenerator implements AICapaGenerator {
  async generateCAPA(context: DeviationContext): Promise<CapaReport> {
    logger.info(
      { deviationId: context.deviationId, ruleName: context.ruleName },
      "Generating AI CAPA report via MockAICapaGenerator",
    );

    const isMedicationViolation =
      context.ruleName.toLowerCase().includes("medication") ||
      context.medicationsLogged.length > 0;

    let rootCause: string;
    let preventiveAction: string;
    let immediateContainment: string;
    let regulatoryAssessment: string;

    if (isMedicationViolation) {
      rootCause = `Failure in pre-dose concomitant medication reconciliation at ${context.siteName} for subject ${context.subjectId}. Prescribing clinician outside the trial network initiated prohibited therapy without notifying the principal investigator or consulting protocol exclusion criteria.`;
      preventiveAction = `1. Conduct mandatory protocol retraining with site clinical staff regarding prohibited concomitant medications list within 5 business days.\n2. Implement an automated EMR electronic prescribing alert blocking contraindicated agents for enrolled subjects.\n3. Issue subject wallet safety cards detailing restricted medications for outside providers.`;
      immediateContainment = `Discontinue prohibited concomitant medication immediately under oversight of Principal Investigator. Perform safety lab workup and evaluate subject for potential drug-drug interactions.`;
      regulatoryAssessment = `Reportable as ${context.gcpSeverity} protocol deviation to the Institutional Review Board (IRB) and trial sponsor within 24 hours per ICH E6(R2) Section 5.18.6.`;
    } else {
      // Window violation
      rootCause = `Patient scheduling conflict and site coordinator scheduling oversight resulting in study visit completed outside protocol-defined compliance window for subject ${context.subjectId}. Primary site coordinator on leave without delegated backup designated for window tracking.`;
      preventiveAction = `1. Reconfigure site scheduling calendar to auto-flag ±24h protocol visit limits with color-coded warning buffers.\n2. Designate secondary delegated study coordinator for scheduling triage during primary staff PTO.\n3. Implement weekly oversight review of upcoming visit targets by Principal Investigator.`;
      immediateContainment = `Document subject safety status and confirm all required assessments for the delayed milestone are fully completed. Re-baseline subsequent visit intervals to protocol schema.`;
      regulatoryAssessment = `Classified as ${context.gcpSeverity} protocol deviation. Log in trial master file deviation tracking register; notify Sponsor Medical Monitor at next quarterly report.`;
    }

    return {
      "Root Cause": rootCause,
      "Preventive Action": preventiveAction,
      "Immediate Containment": immediateContainment,
      "Regulatory Risk Assessment": regulatoryAssessment,
      generatedAt: new Date().toISOString(),
      model: "aegis-capa-copilot-mock-v1.0 (ready for IBM Bob / Gemini swap)",
    };
  }
}

// Default swappable singleton instance
export const aiCapaGenerator: AICapaGenerator = new MockAICapaGenerator();

/**
 * Convenience export for direct invocation
 */
export async function generateMockCAPA(
  context: DeviationContext,
): Promise<CapaReport> {
  return aiCapaGenerator.generateCAPA(context);
}
