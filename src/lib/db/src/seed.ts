import {
  db,
  trialSites,
  users,
  protocolRules,
  patientRecords,
  deviations,
} from "./index";
import { eq } from "drizzle-orm";

/**
 * Realistic seed data for AegisTrial GCP Copilot
 */
export async function seedDatabase() {
  console.log("🌱 Seeding AegisTrial GCP Copilot database...");

  // 1. Seed Trial Sites
  console.log("Seeding trial sites...");
  const [site1] = await db
    .insert(trialSites)
    .values({
      siteName: "Northlake Research Center",
      investigator: "Dr. Naomi Chen",
      location: "Boston, MA, USA",
      riskScore: 92,
    })
    .onConflictDoNothing()
    .returning();

  const [site2] = await db
    .insert(trialSites)
    .values({
      siteName: "St. Vincent Clinical Unit",
      investigator: "Dr. Amina El-Sayed",
      location: "London, UK",
      riskScore: 88,
    })
    .onConflictDoNothing()
    .returning();

  const [site3] = await db
    .insert(trialSites)
    .values({
      siteName: "Mersey Health Sciences",
      investigator: "Dr. Priya Shah",
      location: "Liverpool, UK",
      riskScore: 65,
    })
    .onConflictDoNothing()
    .returning();

  const [site4] = await db
    .insert(trialSites)
    .values({
      siteName: "Asteria University Hospital",
      investigator: "Dr. Felix Bauer",
      location: "Berlin, Germany",
      riskScore: 95,
    })
    .onConflictDoNothing()
    .returning();

  const primarySiteId = site1?.id || (await db.select().from(trialSites).limit(1))[0]?.id;
  const secondarySiteId = site2?.id || primarySiteId;

  // 2. Seed Users
  console.log("Seeding clinical users...");
  await db
    .insert(users)
    .values([
      {
        email: "maya.ortiz@meridian.test",
        role: "RISK_MANAGER",
        siteId: null,
      },
      {
        email: "site.admin@meridian.test",
        role: "SITE_ADMIN",
        siteId: primarySiteId,
      },
      {
        email: "admin.mersey@meridian.test",
        role: "SITE_ADMIN",
        siteId: secondarySiteId,
      },
    ])
    .onConflictDoNothing();

  // 3. Seed Protocol Rules
  console.log("Seeding protocol rules...");
  const [rule1] = await db
    .insert(protocolRules)
    .values({
      ruleName: "Visit Window Compliance (±24 Hours)",
      description:
        "Visits must occur within 24 hours of protocol-defined target interval to preserve pharmacokinetic steady-state validity.",
      maxWindowHours: 24,
      forbiddenMedications: [],
    })
    .onConflictDoNothing()
    .returning();

  const [rule2] = await db
    .insert(protocolRules)
    .values({
      ruleName: "Prohibited Concomitant Medication (CYP3A4 Inhibitors)",
      description:
        "Administration of strong CYP3A4 inhibitors is strictly prohibited due to significant risk of investigational product overexposure and QT prolongation.",
      maxWindowHours: 0,
      forbiddenMedications: [
        "Ketoconazole",
        "Erythromycin",
        "St. John's Wort",
        "Amiodarone",
        "Clarithromycin",
      ],
    })
    .onConflictDoNothing()
    .returning();

  const [rule3] = await db
    .insert(protocolRules)
    .values({
      ruleName: "Critical Dose Timing Delay (±72 Hours)",
      description:
        "Delays exceeding 72 hours require immediate protocol deviation reporting, dose suspension, and safety re-screening.",
      maxWindowHours: 72,
      forbiddenMedications: [],
    })
    .onConflictDoNothing()
    .returning();

  const activeRule1 = rule1 || (await db.select().from(protocolRules).limit(1))[0];
  const activeRule2 = rule2 || (await db.select().from(protocolRules).limit(2))[1] || activeRule1;

  // 4. Seed Initial Patient Records & Deviations
  if (primarySiteId && activeRule1 && activeRule2) {
    console.log("Seeding initial records & deviations...");
    const scheduledDate = new Date("2026-09-01T09:00:00Z");
    const actualDate = new Date("2026-09-03T14:30:00Z"); // ~53.5h delay (exceeds 24h window)

    const [record1] = await db
      .insert(patientRecords)
      .values({
        siteId: primarySiteId,
        subjectId: "SUBJ-1048",
        scheduledDate,
        actualDate,
        medicationsLogged: ["Acetaminophen", "Loratadine"],
      })
      .returning();

    if (record1) {
      await db
        .insert(deviations)
        .values({
          siteId: primarySiteId,
          patientRecordId: record1.id,
          ruleId: activeRule1.id,
          gcpSeverity: "MAJOR",
          status: "OPEN",
          aiCapaReport: null,
        })
        .returning();
    }

    const scheduledDate2 = new Date("2026-09-05T10:00:00Z");
    const actualDate2 = new Date("2026-09-05T10:15:00Z"); // On-time, but logged forbidden medication

    const [record2] = await db
      .insert(patientRecords)
      .values({
        siteId: primarySiteId,
        subjectId: "SUBJ-2091",
        scheduledDate: scheduledDate2,
        actualDate: actualDate2,
        medicationsLogged: ["Aspirin", "Erythromycin"], // Erythromycin is forbidden!
      })
      .returning();

    if (record2) {
      await db
        .insert(deviations)
        .values({
          siteId: primarySiteId,
          patientRecordId: record2.id,
          ruleId: activeRule2.id,
          gcpSeverity: "MAJOR",
          status: "OPEN",
          aiCapaReport: null,
        })
        .returning();
    }
  }

  console.log("✅ Seed completed successfully!");
}

// Direct execution when invoked via node / tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
