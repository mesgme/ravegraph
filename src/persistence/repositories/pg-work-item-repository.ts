import type { Kysely } from 'kysely';
import type { Database } from '../database.js';
import type {
  WorkItemRepository,
  WorkItemFilters,
  WorkItemCounts,
} from '../../domain/ports/work-item-repository.js';
import type { WorkItem, WorkStatus, WorkType } from '../../domain/types.js';

export class PgWorkItemRepository implements WorkItemRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getWorkItems(filters?: WorkItemFilters): Promise<WorkItem[]> {
    let query = this.db
      .selectFrom('work_items')
      .selectAll()
      .orderBy('created_at', 'desc');

    if (filters?.serviceId) {
      query = query.where('service_id', '=', filters.serviceId);
    }
    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }
    if (filters?.controlId) {
      query = query.where('control_id', '=', filters.controlId);
    }

    const rows = await query.execute();
    return rows.map(mapWorkItem);
  }

  async getWorkItemCounts(): Promise<WorkItemCounts> {
    const statusRows = await this.db
      .selectFrom('work_items')
      .select(['status'])
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .groupBy('status')
      .execute();

    const typeRows = await this.db
      .selectFrom('work_items')
      .select(['work_type'])
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .where('work_type', 'is not', null)
      .groupBy('work_type')
      .execute();

    const byStatus = {} as Record<WorkStatus, number>;
    for (const row of statusRows) {
      byStatus[row.status] = parseInt(row.count);
    }

    const byType = {} as Record<WorkType, number>;
    for (const row of typeRows) {
      if (row.work_type) {
        byType[row.work_type] = parseInt(row.count);
      }
    }

    return { byStatus, byType };
  }
}

function mapWorkItem(row: Database['work_items']): WorkItem {
  return {
    id: row.id,
    externalId: row.external_id ?? undefined,
    externalSystem: row.external_system ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    workType: row.work_type ?? undefined,
    controlId: row.control_id ?? undefined,
    incidentId: row.incident_id ?? undefined,
    serviceId: row.service_id ?? undefined,
    status: row.status,
    assignedTo: row.assigned_to ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
