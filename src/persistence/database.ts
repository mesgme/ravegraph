import type {
  ReadinessScoreRow,
  ControlRow,
  WorkItemRow,
  IncidentRow,
  ServiceRow,
  EvidenceItemRow,
  ClaimRow,
  ClaimEvidenceRow,
} from '../domain/types.js';

export interface Database {
  readiness_scores: ReadinessScoreRow;
  controls: ControlRow;
  work_items: WorkItemRow;
  incidents: IncidentRow;
  services: ServiceRow;
  evidence_items: EvidenceItemRow;
  claims: ClaimRow;
  claim_evidence: ClaimEvidenceRow;
}
