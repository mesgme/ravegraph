import type { Kysely, Selectable } from 'kysely';
import { sql } from 'kysely';
import type { Database } from '../database.js';
import type {
  EvidenceRepository,
  EvidenceFilters,
  UpsertEvidenceInput,
} from '../../domain/ports/evidence-repository.js';
import type { EvidenceItem, EvidenceItemRow } from '../../domain/types.js';

export class PgEvidenceRepository implements EvidenceRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getEvidence(id: number): Promise<EvidenceItem | undefined> {
    const row = await this.db
      .selectFrom('evidence_items')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? mapEvidence(row) : undefined;
  }

  async searchEvidence(filters?: EvidenceFilters): Promise<EvidenceItem[]> {
    let query = this.db
      .selectFrom('evidence_items')
      .selectAll()
      .orderBy('collected_at', 'desc');

    if (filters?.serviceId) {
      query = query.where('service_id', '=', filters.serviceId);
    }
    if (filters?.evidenceType) {
      query = query.where('evidence_type', '=', filters.evidenceType);
    }
    if (filters?.tags && filters.tags.length > 0) {
      query = query.where(
        sql<boolean>`tags && ${sql.val(filters.tags)}::text[]`
      );
    }
    if (filters?.freshOnly) {
      query = query.where((eb) =>
        eb.or([
          eb('expires_at', 'is', null),
          eb('expires_at', '>', sql<Date>`NOW()`),
        ])
      );
    }

    const rows = await query.execute();
    return rows.map(mapEvidence);
  }

  async upsertEvidence(input: UpsertEvidenceInput): Promise<EvidenceItem> {
    const collectedAt = input.collectedAt ?? new Date();
    const expiresAt = input.ttlHours
      ? new Date(collectedAt.getTime() + input.ttlHours * 3600_000)
      : null;

    if (input.id) {
      const row = await this.db
        .updateTable('evidence_items')
        .set({
          service_id: input.serviceId,
          evidence_type: input.evidenceType,
          source: input.source,
          body: input.body,
          tags: input.tags ?? [],
          confidence: input.confidence,
          ttl_hours: input.ttlHours ?? null,
          collected_at: collectedAt,
          expires_at: expiresAt,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', input.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      return mapEvidence(row);
    }

    const row = await this.db
      .insertInto('evidence_items')
      .values({
        service_id: input.serviceId,
        evidence_type: input.evidenceType,
        source: input.source,
        body: input.body,
        tags: input.tags ?? [],
        confidence: input.confidence,
        ttl_hours: input.ttlHours ?? null,
        collected_at: collectedAt,
        expires_at: expiresAt,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return mapEvidence(row);
  }

  async deleteEvidence(id: number): Promise<void> {
    await this.db
      .deleteFrom('evidence_items')
      .where('id', '=', id)
      .execute();
  }
}

function mapEvidence(row: Selectable<EvidenceItemRow>): EvidenceItem {
  return {
    id: row.id,
    serviceId: row.service_id,
    evidenceType: row.evidence_type,
    source: row.source,
    body: row.body,
    tags: row.tags,
    confidence: row.confidence,
    ttlHours: row.ttl_hours ?? undefined,
    collectedAt: row.collected_at,
    expiresAt: row.expires_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
