import { sql, type Kysely } from 'kysely';
import type { Database } from '../database.js';
import type {
  ReadinessRepository,
  ReadinessFilters,
} from '../../domain/ports/readiness-repository.js';
import type { ReadinessScore } from '../../domain/types.js';
import { DEFAULT_DAYS_BACK } from '../../domain/constants.js';

export class PgReadinessRepository implements ReadinessRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getScores(filters?: ReadinessFilters): Promise<ReadinessScore[]> {
    const daysBack = filters?.daysBack ?? DEFAULT_DAYS_BACK;

    let query = this.db
      .selectFrom('readiness_scores')
      .selectAll()
      .where(
        'recorded_at',
        '>=',
        sql<Date>`NOW() - INTERVAL '1 day' * ${daysBack}`
      )
      .orderBy('service_id')
      .orderBy('recorded_at', 'desc');

    if (filters?.serviceId) {
      query = query.where('service_id', '=', filters.serviceId);
    }

    const rows = await query.execute();
    return rows.map(mapReadinessScore);
  }

  async getAverageScore(): Promise<number> {
    const result = await sql<{ avg_score: string }>`
      SELECT AVG(score) as avg_score
      FROM (
        SELECT DISTINCT ON (service_id) service_id, score
        FROM readiness_scores
        ORDER BY service_id, recorded_at DESC
      ) latest_scores
    `.execute(this.db);

    return parseFloat(result.rows[0]?.avg_score ?? '0');
  }

  async getTrackedServicesCount(): Promise<number> {
    const result = await this.db
      .selectFrom('readiness_scores')
      .select((eb) => eb.fn.count<string>(sql`DISTINCT service_id`).as('count'))
      .executeTakeFirstOrThrow();

    return parseInt(result.count);
  }
}

function mapReadinessScore(row: Database['readiness_scores']): ReadinessScore {
  return {
    id: row.id,
    serviceId: row.service_id,
    serviceName: row.service_name,
    score: parseFloat(row.score),
    sectionScores: row.section_scores ?? undefined,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
  };
}
