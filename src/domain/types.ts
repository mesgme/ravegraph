/**
 * Domain types for the Work Dashboard
 */

// Readiness Trends (Issue #9)
export interface ReadinessScore {
  id: number;
  serviceId: string;
  serviceName: string;
  score: number;
  sectionScores?: Record<string, number>;
  recordedAt: Date;
  createdAt: Date;
}

export interface ReadinessTrend {
  serviceId: string;
  serviceName: string;
  currentScore: number;
  previousScore?: number;
  trend: TrendDirection;
  scores: ReadinessScore[];
}

// Resilience Backlog (Issue #23)
export type ControlType = 'PREVENT' | 'DETECT' | 'RESPOND' | 'LEARN';
export type ControlStatus =
  | 'PROPOSED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Control {
  id: number;
  controlType: ControlType;
  title: string;
  description?: string;
  incidentId?: number;
  serviceId?: string;
  priority?: Priority;
  status: ControlStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Incident-derived Work (Issue #24)
export type WorkType =
  | 'REMEDIATION'
  | 'INVESTIGATION'
  | 'DOCUMENTATION'
  | 'MODEL_UPDATE';
export type WorkStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CLOSED';
export type ExternalSystem = 'GITHUB' | 'JIRA' | 'LINEAR';

export interface WorkItem {
  id: number;
  externalId?: string;
  externalSystem?: ExternalSystem;
  title: string;
  description?: string;
  workType?: WorkType;
  controlId?: number;
  incidentId?: number;
  serviceId?: string;
  status: WorkStatus;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Incidents
export type Severity = 'SEV1' | 'SEV2' | 'SEV3' | 'SEV4';

export interface Incident {
  id: number;
  title: string;
  severity?: Severity;
  serviceId?: string;
  startedAt: Date;
  resolvedAt?: Date;
  impact?: string;
  createdAt: Date;
}

// Services
export interface Service {
  id: string;
  name: string;
  tier?: string;
  createdAt: Date;
}

export type TrendDirection = 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NEW';

// Database row types for Kysely
export interface ReadinessScoreRow {
  id: number;
  service_id: string;
  service_name: string;
  score: string; // DECIMAL comes as string from pg
  section_scores: Record<string, number> | null;
  recorded_at: Date;
  created_at: Date;
}

export interface ControlRow {
  id: number;
  control_type: ControlType;
  title: string;
  description: string | null;
  incident_id: number | null;
  service_id: string | null;
  priority: Priority | null;
  status: ControlStatus;
  created_at: Date;
  updated_at: Date;
}

export interface WorkItemRow {
  id: number;
  external_id: string | null;
  external_system: ExternalSystem | null;
  title: string;
  description: string | null;
  work_type: WorkType | null;
  control_id: number | null;
  incident_id: number | null;
  service_id: string | null;
  status: WorkStatus;
  assigned_to: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IncidentRow {
  id: number;
  title: string;
  severity: Severity | null;
  service_id: string | null;
  started_at: Date;
  resolved_at: Date | null;
  impact: string | null;
  created_at: Date;
}

export interface ServiceRow {
  id: string;
  name: string;
  tier: string | null;
  created_at: Date;
}

// Work Dashboard Aggregated View
export interface WorkDashboard {
  resilienceBacklog: {
    controls: Control[];
    countByType: Record<ControlType, number>;
    countByPriority: Record<Priority, number>;
    countByStatus: Record<ControlStatus, number>;
  };
  incidentWork: {
    workItems: WorkItem[];
    countByStatus: Record<WorkStatus, number>;
    countByType: Record<WorkType, number>;
  };
  readinessTrends: ReadinessTrend[];
  summary: {
    totalControls: number;
    totalWorkItems: number;
    servicesTracked: number;
    avgReadinessScore: number;
  };
}
