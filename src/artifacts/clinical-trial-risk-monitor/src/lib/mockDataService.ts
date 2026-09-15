import {
  adverseEvents,
  audit,
  capas,
  dosingRecords,
  findings,
  notifications,
  participants,
  rules,
  sites,
  trials,
  visitRecords,
  type AdverseEvent,
  type AuditItem,
  type Capa,
  type DosingRecord,
  type Finding,
  type Notification,
  type Participant,
  type Rule,
  type Site,
  type Trial,
  type VisitRecord,
} from '@/data/mockData';

export interface ClinicalTrialDataService {
  getTrials(): readonly Trial[];
  getSites(): readonly Site[];
  getSite(id: string): Site | undefined;
  getParticipants(): readonly Participant[];
  getParticipant(id: string): Participant | undefined;
  getFindings(): readonly Finding[];
  getFinding(id: string): Finding | undefined;
  getProtocolRules(): readonly Rule[];
  getProtocolRule(id: string): Rule | undefined;
  getCAPA(): readonly Capa[];
  getCAPADetail(id: string): Capa | undefined;
  getAuditActivity(): readonly AuditItem[];
  getNotifications(): readonly Notification[];
  getVisitRecords(): readonly VisitRecord[];
  getDosingRecords(): readonly DosingRecord[];
  getAdverseEvents(): readonly AdverseEvent[];
}

/**
 * The UI consumes this interface instead of importing records directly.
 * A future API-backed implementation can satisfy the same contract without
 * changing page components or presentation logic.
 */
export const mockDataService: ClinicalTrialDataService = {
  getTrials: () => trials,
  getSites: () => sites,
  getSite: (id) => sites.find((site) => site.id === id),
  getParticipants: () => participants,
  getParticipant: (id) => participants.find((participant) => participant.id === id),
  getFindings: () => findings,
  getFinding: (id) => findings.find((finding) => finding.id === id),
  getProtocolRules: () => rules,
  getProtocolRule: (id) => rules.find((rule) => rule.id === id),
  getCAPA: () => capas,
  getCAPADetail: (id) => capas.find((capa) => capa.id === id),
  getAuditActivity: () => audit,
  getNotifications: () => notifications,
  getVisitRecords: () => visitRecords,
  getDosingRecords: () => dosingRecords,
  getAdverseEvents: () => adverseEvents,
};