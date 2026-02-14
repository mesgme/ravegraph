import type { Kysely } from 'kysely';
import type { Database } from '../database.js';
import type {
  ControlRepository,
  ControlFilters,
  ControlCounts,
} from '../../domain/ports/control-repository.js';
import type {
  Control,
  ControlType,
  Priority,
  ControlStatus,
} from '../../domain/types.js';

export class PgControlRepository implements ControlRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getControls(filters?: ControlFilters): Promise<Control[]> {
    let query = this.db
      .selectFrom('controls')
      .selectAll()
      .orderBy('created_at', 'desc');

    if (filters?.serviceId) {
      query = query.where('service_id', '=', filters.serviceId);
    }
    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }
    if (filters?.priority) {
      query = query.where('priority', '=', filters.priority);
    }

    const rows = await query.execute();
    return rows.map(mapControl);
  }

  async getControlCounts(): Promise<ControlCounts> {
    const typeRows = await this.db
      .selectFrom('controls')
      .select(['control_type'])
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .groupBy('control_type')
      .execute();

    const priorityRows = await this.db
      .selectFrom('controls')
      .select(['priority'])
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .where('priority', 'is not', null)
      .groupBy('priority')
      .execute();

    const statusRows = await this.db
      .selectFrom('controls')
      .select(['status'])
      .select((eb) => eb.fn.count<string>('id').as('count'))
      .groupBy('status')
      .execute();

    const byType = {} as Record<ControlType, number>;
    for (const row of typeRows) {
      byType[row.control_type] = parseInt(row.count);
    }

    const byPriority = {} as Record<Priority, number>;
    for (const row of priorityRows) {
      if (row.priority) {
        byPriority[row.priority] = parseInt(row.count);
      }
    }

    const byStatus = {} as Record<ControlStatus, number>;
    for (const row of statusRows) {
      byStatus[row.status] = parseInt(row.count);
    }

    return { byType, byPriority, byStatus };
  }
}

function mapControl(row: Database['controls']): Control {
  return {
    id: row.id,
    controlType: row.control_type,
    title: row.title,
    description: row.description ?? undefined,
    incidentId: row.incident_id ?? undefined,
    serviceId: row.service_id ?? undefined,
    priority: row.priority ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
