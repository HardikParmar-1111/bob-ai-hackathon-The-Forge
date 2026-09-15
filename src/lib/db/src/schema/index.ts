import {
  pgTable,
  text,
  integer,
  timestamp,
  jsonb,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const userRoleEnum = pgEnum("user_role", ["SITE_ADMIN", "RISK_MANAGER"]);

export const gcpSeverityEnum = pgEnum("gcp_severity", [
  "MAJOR",
  "MINOR",
  "ADMINISTRATIVE",
]);

export const deviationStatusEnum = pgEnum("deviation_status", [
  "OPEN",
  "RESOLVED",
]);

// ---------------------------------------------------------------------------
// Table Definitions
// ---------------------------------------------------------------------------

/**
 * Trial Sites
 * Tracks trial locations, investigators, and dynamic GCP risk scores.
 */
export const trialSites = pgTable("trial_sites", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteName: text("site_name").notNull(),
  investigator: text("investigator").notNull(),
  location: text("location").notNull(),
  riskScore: integer("risk_score").notNull().default(100),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Users
 * Multi-role clinical trial users (Site Admins scoped to a site, Risk Managers global).
 */
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull(),
  siteId: uuid("site_id").references(() => trialSites.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Protocol Rules
 * Versioned GCP protocol rules for automated compliance verification.
 */
export const protocolRules = pgTable("protocol_rules", {
  id: uuid("id").defaultRandom().primaryKey(),
  ruleName: text("rule_name").notNull(),
  description: text("description").notNull(),
  maxWindowHours: integer("max_window_hours").notNull(),
  forbiddenMedications: jsonb("forbidden_medications")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Patient Records
 * Clinical visit & dosing data logged by Site Admins.
 */
export const patientRecords = pgTable("patient_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => trialSites.id, { onDelete: "cascade" }),
  subjectId: text("subject_id").notNull(),
  scheduledDate: timestamp("scheduled_date", { withTimezone: true }).notNull(),
  actualDate: timestamp("actual_date", { withTimezone: true }).notNull(),
  medicationsLogged: jsonb("medications_logged")
    .$type<string[]>()
    .notNull()
    .default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * Deviations
 * Automated protocol violations detected by the Rule Engine.
 */
export const deviations = pgTable("deviations", {
  id: uuid("id").defaultRandom().primaryKey(),
  siteId: uuid("site_id")
    .notNull()
    .references(() => trialSites.id, { onDelete: "cascade" }),
  patientRecordId: uuid("patient_record_id")
    .notNull()
    .references(() => patientRecords.id, { onDelete: "cascade" }),
  ruleId: uuid("rule_id")
    .notNull()
    .references(() => protocolRules.id, { onDelete: "cascade" }),
  gcpSeverity: gcpSeverityEnum("gcp_severity").notNull(),
  aiCapaReport: text("ai_capa_report"),
  status: deviationStatusEnum("status").notNull().default("OPEN"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const trialSitesRelations = relations(trialSites, ({ many }) => ({
  users: many(users),
  patientRecords: many(patientRecords),
  deviations: many(deviations),
}));

export const usersRelations = relations(users, ({ one }) => ({
  site: one(trialSites, {
    fields: [users.siteId],
    references: [trialSites.id],
  }),
}));

export const protocolRulesRelations = relations(protocolRules, ({ many }) => ({
  deviations: many(deviations),
}));

export const patientRecordsRelations = relations(
  patientRecords,
  ({ one, many }) => ({
    site: one(trialSites, {
      fields: [patientRecords.siteId],
      references: [trialSites.id],
    }),
    deviations: many(deviations),
  }),
);

export const deviationsRelations = relations(deviations, ({ one }) => ({
  site: one(trialSites, {
    fields: [deviations.siteId],
    references: [trialSites.id],
  }),
  patientRecord: one(patientRecords, {
    fields: [deviations.patientRecordId],
    references: [patientRecords.id],
  }),
  rule: one(protocolRules, {
    fields: [deviations.ruleId],
    references: [protocolRules.id],
  }),
}));

// ---------------------------------------------------------------------------
// Model Types
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type TrialSite = typeof trialSites.$inferSelect;
export type InsertTrialSite = typeof trialSites.$inferInsert;

export type ProtocolRule = typeof protocolRules.$inferSelect;
export type InsertProtocolRule = typeof protocolRules.$inferInsert;

export type PatientRecord = typeof patientRecords.$inferSelect;
export type InsertPatientRecord = typeof patientRecords.$inferInsert;

export type Deviation = typeof deviations.$inferSelect;
export type InsertDeviation = typeof deviations.$inferInsert;