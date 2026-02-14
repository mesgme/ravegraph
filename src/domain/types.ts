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
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NEW';
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
