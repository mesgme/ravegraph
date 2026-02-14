import { pool } from './db.js';
import type {
  Control,
  WorkItem,
  ReadinessScore,
  ReadinessTrend,
  WorkDashboard,
  ControlType,
  Priority,
  ControlStatus,
  WorkStatus,
  WorkType,
} from '../domain/types.js';

/**
 * Repository for Work Dashboard data access
 */

// Resilience Backlog queries
export async function getControls(filters?: {
  serviceId?: string;
  status?: ControlStatus;
  priority?: Priority;
}): Promise<Control[]> {
  let query = 'SELECT * FROM controls WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.serviceId) {
    query += ` AND service_id = $${paramIndex}`;
    params.push(filters.serviceId);
    paramIndex++;
  }

  if (filters?.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters?.priority) {
    query += ` AND priority = $${paramIndex}`;
    params.push(filters.priority);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows.map(mapControlFromDb);
}

export async function getControlCounts(): Promise<{
  byType: Record<ControlType, number>;
  byPriority: Record<Priority, number>;
  byStatus: Record<ControlStatus, number>;
}> {
  const typeQuery = `
    SELECT control_type, COUNT(*) as count 
    FROM controls 
    GROUP BY control_type
  `;
  
  const priorityQuery = `
    SELECT priority, COUNT(*) as count 
    FROM controls 
    WHERE priority IS NOT NULL
    GROUP BY priority
  `;
  
  const statusQuery = `
    SELECT status, COUNT(*) as count 
    FROM controls 
    GROUP BY status
  `;

  const [typeResult, priorityResult, statusResult] = await Promise.all([
    pool.query(typeQuery),
    pool.query(priorityQuery),
    pool.query(statusQuery),
  ]);

  const byType = {} as Record<ControlType, number>;
  typeResult.rows.forEach(row => {
    byType[row.control_type as ControlType] = parseInt(row.count);
  });

  const byPriority = {} as Record<Priority, number>;
  priorityResult.rows.forEach(row => {
    byPriority[row.priority as Priority] = parseInt(row.count);
  });

  const byStatus = {} as Record<ControlStatus, number>;
  statusResult.rows.forEach(row => {
    byStatus[row.status as ControlStatus] = parseInt(row.count);
  });

  return { byType, byPriority, byStatus };
}

// Incident-derived Work queries
export async function getWorkItems(filters?: {
  serviceId?: string;
  status?: WorkStatus;
  controlId?: number;
}): Promise<WorkItem[]> {
  let query = 'SELECT * FROM work_items WHERE 1=1';
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.serviceId) {
    query += ` AND service_id = $${paramIndex}`;
    params.push(filters.serviceId);
    paramIndex++;
  }

  if (filters?.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters?.controlId) {
    query += ` AND control_id = $${paramIndex}`;
    params.push(filters.controlId);
    paramIndex++;
  }

  query += ' ORDER BY created_at DESC';

  const result = await pool.query(query, params);
  return result.rows.map(mapWorkItemFromDb);
}

export async function getWorkItemCounts(): Promise<{
  byStatus: Record<WorkStatus, number>;
  byType: Record<WorkType, number>;
}> {
  const statusQuery = `
    SELECT status, COUNT(*) as count 
    FROM work_items 
    GROUP BY status
  `;
  
  const typeQuery = `
    SELECT work_type, COUNT(*) as count 
    FROM work_items 
    WHERE work_type IS NOT NULL
    GROUP BY work_type
  `;

  const [statusResult, typeResult] = await Promise.all([
    pool.query(statusQuery),
    pool.query(typeQuery),
  ]);

  const byStatus = {} as Record<WorkStatus, number>;
  statusResult.rows.forEach(row => {
    byStatus[row.status as WorkStatus] = parseInt(row.count);
  });

  const byType = {} as Record<WorkType, number>;
  typeResult.rows.forEach(row => {
    byType[row.work_type as WorkType] = parseInt(row.count);
  });

  return { byStatus, byType };
}

// Readiness Trends queries
export async function getReadinessTrends(options?: {
  serviceId?: string;
  daysBack?: number;
}): Promise<ReadinessTrend[]> {
  const daysBack = options?.daysBack || 30;
  
  let query = `
    SELECT 
      service_id,
      service_name,
      score,
      section_scores,
      recorded_at
    FROM readiness_scores
    WHERE recorded_at >= NOW() - INTERVAL '${daysBack} days'
  `;

  const params: any[] = [];
  if (options?.serviceId) {
    query += ' AND service_id = $1';
    params.push(options.serviceId);
  }

  query += ' ORDER BY service_id, recorded_at DESC';

  const result = await pool.query(query, params);
  
  // Group scores by service
  const serviceScores = new Map<string, ReadinessScore[]>();
  result.rows.forEach(row => {
    const score = mapReadinessScoreFromDb(row);
    if (!serviceScores.has(score.serviceId)) {
      serviceScores.set(score.serviceId, []);
    }
    serviceScores.get(score.serviceId)!.push(score);
  });

  // Build trends
  const trends: ReadinessTrend[] = [];
  serviceScores.forEach((scores, serviceId) => {
    if (scores.length === 0) return;
    
    const currentScore = scores[0];
    const previousScore = scores.length > 1 ? scores[1] : undefined;
    
    let trend: 'IMPROVING' | 'DECLINING' | 'STABLE' | 'NEW' = 'NEW';
    if (previousScore) {
      const diff = currentScore.score - previousScore.score;
      if (diff > 1) trend = 'IMPROVING';
      else if (diff < -1) trend = 'DECLINING';
      else trend = 'STABLE';
    }

    trends.push({
      serviceId: currentScore.serviceId,
      serviceName: currentScore.serviceName,
      currentScore: currentScore.score,
      previousScore: previousScore?.score,
      trend,
      scores,
    });
  });

  return trends;
}

export async function getAverageReadinessScore(): Promise<number> {
  const query = `
    SELECT AVG(score) as avg_score
    FROM (
      SELECT DISTINCT ON (service_id) service_id, score
      FROM readiness_scores
      ORDER BY service_id, recorded_at DESC
    ) latest_scores
  `;
  
  const result = await pool.query(query);
  return parseFloat(result.rows[0]?.avg_score || '0');
}

export async function getTrackedServicesCount(): Promise<number> {
  const query = 'SELECT COUNT(DISTINCT service_id) as count FROM readiness_scores';
  const result = await pool.query(query);
  return parseInt(result.rows[0]?.count || '0');
}

// Full dashboard aggregation
export async function getWorkDashboard(filters?: {
  serviceId?: string;
}): Promise<WorkDashboard> {
  const [
    controls,
    controlCounts,
    workItems,
    workItemCounts,
    readinessTrends,
    avgScore,
    servicesCount,
  ] = await Promise.all([
    getControls(filters),
    getControlCounts(),
    getWorkItems(filters),
    getWorkItemCounts(),
    getReadinessTrends(filters),
    getAverageReadinessScore(),
    getTrackedServicesCount(),
  ]);

  return {
    resilienceBacklog: {
      controls,
      countByType: controlCounts.byType,
      countByPriority: controlCounts.byPriority,
      countByStatus: controlCounts.byStatus,
    },
    incidentWork: {
      workItems,
      countByStatus: workItemCounts.byStatus,
      countByType: workItemCounts.byType,
    },
    readinessTrends,
    summary: {
      totalControls: controls.length,
      totalWorkItems: workItems.length,
      servicesTracked: servicesCount,
      avgReadinessScore: avgScore,
    },
  };
}

// Mapping functions
function mapControlFromDb(row: any): Control {
  return {
    id: row.id,
    controlType: row.control_type,
    title: row.title,
    description: row.description,
    incidentId: row.incident_id,
    serviceId: row.service_id,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapWorkItemFromDb(row: any): WorkItem {
  return {
    id: row.id,
    externalId: row.external_id,
    externalSystem: row.external_system,
    title: row.title,
    description: row.description,
    workType: row.work_type,
    controlId: row.control_id,
    incidentId: row.incident_id,
    serviceId: row.service_id,
    status: row.status,
    assignedTo: row.assigned_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapReadinessScoreFromDb(row: any): ReadinessScore {
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    score: parseFloat(row.score),
    sectionScores: row.section_scores,
    recordedAt: row.recorded_at,
    createdAt: row.created_at || row.recorded_at,
  };
}
