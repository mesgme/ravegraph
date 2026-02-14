import type {
  ReadinessScoreRow,
  ControlRow,
  WorkItemRow,
  IncidentRow,
  ServiceRow,
} from '../domain/types.js';

export interface Database {
  readiness_scores: ReadinessScoreRow;
  controls: ControlRow;
  work_items: WorkItemRow;
  incidents: IncidentRow;
  services: ServiceRow;
}
