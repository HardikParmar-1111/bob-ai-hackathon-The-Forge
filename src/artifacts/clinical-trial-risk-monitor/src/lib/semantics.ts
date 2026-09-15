export type SemanticTone = 'neutral' | 'teal' | 'amber' | 'red' | 'green';

const statusTones: Record<string, SemanticTone> = {
  Active: 'green',
  Enabled: 'green',
  Complete: 'green',
  Completed: 'green',
  Closed: 'green',
  Resolved: 'green',
  Recorded: 'green',
  Open: 'amber',
  Draft: 'neutral',
  'In review': 'amber',
  'In progress': 'amber',
  'Needs review': 'amber',
  'Follow-up due': 'amber',
  'Awaiting evidence': 'amber',
  'Confirmed deviation': 'red',
  Flagged: 'red',
  Critical: 'red',
};

export function toneForStatus(status: string): SemanticTone {
  return statusTones[status] ?? 'neutral';
}