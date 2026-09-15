export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type FindingStatus = 'Open' | 'In review' | 'Confirmed deviation' | 'Closed';

export type Trial = { id: string; name: string; phase: string; status: string; sites: number; participants: number };
export type Site = { id: string; name: string; country: string; trial: string; investigator: string; risk: RiskLevel; score: number; participants: number; lastReview: string; status: string };
export type Participant = { id: string; site: string; trial: string; status: string; consent: string; lastVisit: string; risk: RiskLevel };
export type Finding = { id: string; title: string; site: string; trial: string; severity: RiskLevel; status: FindingStatus; source: 'Automated check failed' | 'Deviation confirmed' | 'Manual review'; opened: string; owner: string };
export type Rule = { id: string; name: string; domain: string; version: string; status: string; lastRun: string; triggered: number; description: string };
export type Capa = { id: string; title: string; site: string; priority: RiskLevel; status: string; owner: string; due: string; progress: number };
export type AuditItem = { id: string; action: string; actor: string; subject: string; timestamp: string; type: string };
export type Notification = { id: string; title: string; body: string; type: 'Critical' | 'Review' | 'System'; time: string; read: boolean };
export type VisitRecord = { id: string; participant: string; site: string; visit: string; date: string; status: string; reviewer: string };
export type DosingRecord = { id: string; participant: string; site: string; cohort: string; dose: string; date: string; status: string };
export type AdverseEvent = { id: string; participant: string; site: string; term: string; severity: RiskLevel; onset: string; status: string };

export const trials: Trial[] = [
  { id: 'TRIAL-101', name: 'ORBIT-101', phase: 'Phase IIb', status: 'Active', sites: 24, participants: 412 },
  { id: 'TRIAL-202', name: 'LUMEN-202', phase: 'Phase III', status: 'Active', sites: 18, participants: 638 },
];

export const sites: Site[] = [
  { id: 'SITE-014', name: 'Northlake Research Center', country: 'United States', trial: 'TRIAL-101', investigator: 'Dr. Naomi Chen', risk: 'High', score: 78, participants: 28, lastReview: '18 Jun 2025', status: 'Active' },
  { id: 'SITE-008', name: 'St. Vincent Clinical Unit', country: 'United Kingdom', trial: 'TRIAL-202', investigator: 'Dr. Amina El-Sayed', risk: 'Moderate', score: 54, participants: 41, lastReview: '16 Jun 2025', status: 'Active' },
  { id: 'SITE-021', name: 'Harborview Medical Group', country: 'Canada', trial: 'TRIAL-101', investigator: 'Dr. Lucas Fournier', risk: 'Low', score: 22, participants: 19, lastReview: '14 Jun 2025', status: 'Active' },
  { id: 'SITE-003', name: 'Mersey Health Sciences', country: 'United Kingdom', trial: 'TRIAL-202', investigator: 'Dr. Priya Shah', risk: 'Critical', score: 91, participants: 36, lastReview: '12 Jun 2025', status: 'Needs review' },
  { id: 'SITE-017', name: 'Asteria University Hospital', country: 'Germany', trial: 'TRIAL-101', investigator: 'Dr. Felix Bauer', risk: 'Moderate', score: 48, participants: 23, lastReview: '10 Jun 2025', status: 'Active' },
  { id: 'SITE-026', name: 'Cedar Ridge Institute', country: 'Australia', trial: 'TRIAL-202', investigator: 'Dr. Mei Lin', risk: 'Low', score: 17, participants: 31, lastReview: '08 Jun 2025', status: 'Active' },
];

export const participants: Participant[] = [
  { id: 'P-001', site: 'SITE-014', trial: 'TRIAL-101', status: 'On treatment', consent: '03 Mar 2025', lastVisit: '17 Jun 2025', risk: 'Moderate' },
  { id: 'P-014', site: 'SITE-008', trial: 'TRIAL-202', status: 'Screening', consent: '14 Jun 2025', lastVisit: '16 Jun 2025', risk: 'Low' },
  { id: 'P-027', site: 'SITE-003', trial: 'TRIAL-202', status: 'On treatment', consent: '22 Apr 2025', lastVisit: '11 Jun 2025', risk: 'High' },
  { id: 'P-033', site: 'SITE-021', trial: 'TRIAL-101', status: 'Follow-up', consent: '19 Feb 2025', lastVisit: '09 Jun 2025', risk: 'Low' },
  { id: 'P-041', site: 'SITE-017', trial: 'TRIAL-101', status: 'On treatment', consent: '27 May 2025', lastVisit: '05 Jun 2025', risk: 'Moderate' },
  { id: 'P-052', site: 'SITE-026', trial: 'TRIAL-202', status: 'Screening', consent: '01 Jun 2025', lastVisit: '04 Jun 2025', risk: 'Low' },
  { id: 'P-068', site: 'SITE-014', trial: 'TRIAL-101', status: 'On treatment', consent: '08 May 2025', lastVisit: '02 Jun 2025', risk: 'High' },
];

export const findings: Finding[] = [
  { id: 'FND-2408', title: 'Visit window exceeded for Week 8', site: 'SITE-014', trial: 'TRIAL-101', severity: 'High', status: 'Open', source: 'Automated check failed', opened: '18 Jun 2025', owner: 'M. Ortiz' },
  { id: 'FND-2404', title: 'Missing source document signature', site: 'SITE-003', trial: 'TRIAL-202', severity: 'Critical', status: 'Confirmed deviation', source: 'Deviation confirmed', opened: '17 Jun 2025', owner: 'R. Mensah' },
  { id: 'FND-2399', title: 'Dose administered outside tolerance', site: 'SITE-008', trial: 'TRIAL-202', severity: 'Moderate', status: 'In review', source: 'Automated check failed', opened: '16 Jun 2025', owner: 'T. Nguyen' },
  { id: 'FND-2387', title: 'Unscheduled visit recorded', site: 'SITE-017', trial: 'TRIAL-101', severity: 'Low', status: 'Closed', source: 'Manual review', opened: '13 Jun 2025', owner: 'M. Ortiz' },
  { id: 'FND-2375', title: 'Consent version mismatch', site: 'SITE-014', trial: 'TRIAL-101', severity: 'High', status: 'In review', source: 'Deviation confirmed', opened: '11 Jun 2025', owner: 'R. Mensah' },
  { id: 'FND-2362', title: 'Lab result entered after visit close', site: 'SITE-021', trial: 'TRIAL-101', severity: 'Low', status: 'Closed', source: 'Automated check failed', opened: '08 Jun 2025', owner: 'T. Nguyen' },
];

export const rules: Rule[] = [
  { id: 'RULE-017', name: 'Visit window tolerance', domain: 'Visit compliance', version: 'v2.4', status: 'Enabled', lastRun: '18 Jun 2025 · 06:00', triggered: 14, description: 'Flags visits recorded outside the protocol-defined window.' },
  { id: 'RULE-024', name: 'Dose administration timing', domain: 'Dosing', version: 'v1.9', status: 'Enabled', lastRun: '18 Jun 2025 · 06:00', triggered: 6, description: 'Compares administration time against the allowed dosing interval.' },
  { id: 'RULE-031', name: 'Consent version alignment', domain: 'Consent', version: 'v3.1', status: 'Enabled', lastRun: '18 Jun 2025 · 06:00', triggered: 3, description: 'Checks that the consent version matches the currently approved document.' },
  { id: 'RULE-042', name: 'AE follow-up completeness', domain: 'Safety reporting', version: 'v1.2', status: 'Draft', lastRun: '—', triggered: 0, description: 'Checks required follow-up fields for reportable adverse events.' },
];

export const capas: Capa[] = [
  { id: 'CAPA-118', title: 'Retrain delegated staff on source sign-off', site: 'SITE-003', priority: 'Critical', status: 'In progress', owner: 'R. Mensah', due: '28 Jun 2025', progress: 62 },
  { id: 'CAPA-114', title: 'Reconcile missed Week 8 visit windows', site: 'SITE-014', priority: 'High', status: 'Awaiting evidence', owner: 'M. Ortiz', due: '02 Jul 2025', progress: 34 },
  { id: 'CAPA-109', title: 'Update dosing worksheet review step', site: 'SITE-008', priority: 'Moderate', status: 'Complete', owner: 'T. Nguyen', due: '20 Jun 2025', progress: 100 },
];

export const audit: AuditItem[] = [
  { id: 'AUD-9012', action: 'Status changed', actor: 'Rosa Mensah', subject: 'FND-2404 · Confirmed deviation', timestamp: '18 Jun 2025 · 09:42', type: 'Finding' },
  { id: 'AUD-9011', action: 'Evidence attached', actor: 'Maya Ortiz', subject: 'CAPA-114 · visit reconciliation', timestamp: '18 Jun 2025 · 08:17', type: 'CAPA' },
  { id: 'AUD-9009', action: 'Rule executed', actor: 'System monitor', subject: 'RULE-017 · 14 triggers', timestamp: '18 Jun 2025 · 06:00', type: 'Protocol rule' },
  { id: 'AUD-9004', action: 'Record updated', actor: 'Thomas Nguyen', subject: 'P-041 · visit record', timestamp: '17 Jun 2025 · 16:28', type: 'Participant' },
];

export const notifications: Notification[] = [
  { id: 'N-01', title: 'Critical finding needs review', body: 'FND-2404 at SITE-003 has been confirmed as a deviation.', type: 'Critical', time: '18 min ago', read: false },
  { id: 'N-02', title: 'CAPA evidence due soon', body: 'CAPA-114 evidence is due in 14 days.', type: 'Review', time: '2 hours ago', read: false },
  { id: 'N-03', title: 'Nightly rule run completed', body: '24 sites checked; 6 new triggers require triage.', type: 'System', time: '3 hours ago', read: true },
];

export const visitRecords: VisitRecord[] = [
  { id: 'VIS-6021', participant: 'P-001', site: 'SITE-014', visit: 'Week 8', date: '17 Jun 2025', status: 'Needs review', reviewer: 'Maya Ortiz' },
  { id: 'VIS-6018', participant: 'P-014', site: 'SITE-008', visit: 'Screening', date: '16 Jun 2025', status: 'Complete', reviewer: 'Thomas Nguyen' },
  { id: 'VIS-6007', participant: 'P-027', site: 'SITE-003', visit: 'Week 12', date: '11 Jun 2025', status: 'Complete', reviewer: 'Rosa Mensah' },
  { id: 'VIS-5998', participant: 'P-041', site: 'SITE-017', visit: 'Baseline', date: '05 Jun 2025', status: 'Complete', reviewer: 'Maya Ortiz' },
];

export const dosingRecords: DosingRecord[] = [
  { id: 'DOS-4108', participant: 'P-001', site: 'SITE-014', cohort: 'Cohort A', dose: '100 mg', date: '17 Jun 2025 · 10:24', status: 'Recorded' },
  { id: 'DOS-4102', participant: 'P-027', site: 'SITE-003', cohort: 'Cohort B', dose: '200 mg', date: '11 Jun 2025 · 09:08', status: 'Flagged' },
  { id: 'DOS-4094', participant: 'P-041', site: 'SITE-017', cohort: 'Cohort A', dose: '100 mg', date: '05 Jun 2025 · 08:45', status: 'Recorded' },
];

export const adverseEvents: AdverseEvent[] = [
  { id: 'AE-2204', participant: 'P-027', site: 'SITE-003', term: 'Transient headache', severity: 'Moderate', onset: '12 Jun 2025', status: 'Follow-up due' },
  { id: 'AE-2198', participant: 'P-068', site: 'SITE-014', term: 'Injection site reaction', severity: 'Low', onset: '02 Jun 2025', status: 'Resolved' },
  { id: 'AE-2181', participant: 'P-041', site: 'SITE-017', term: 'Nausea', severity: 'Low', onset: '06 Jun 2025', status: 'Resolved' },
];

export const trendData = [
  { label: 'Jan', open: 11, confirmed: 4 }, { label: 'Feb', open: 13, confirmed: 5 }, { label: 'Mar', open: 10, confirmed: 3 },
  { label: 'Apr', open: 17, confirmed: 6 }, { label: 'May', open: 14, confirmed: 7 }, { label: 'Jun', open: 9, confirmed: 5 },
];