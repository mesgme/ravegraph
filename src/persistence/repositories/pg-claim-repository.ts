import type { Kysely, Selectable } from 'kysely';
import { sql } from 'kysely';
import type { Database } from '../database.js';
import type {
  ClaimRepository,
  ClaimFilters,
  UpsertClaimInput,
} from '../../domain/ports/claim-repository.js';
import type {
  Claim,
  ClaimRow,
  ClaimWithEvidence,
  EvidenceItem,
  EvidenceItemRow,
} from '../../domain/types.js';

export class PgClaimRepository implements ClaimRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getClaim(id: number): Promise<ClaimWithEvidence | undefined> {
    const claimRow = await this.db
      .selectFrom('claims')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!claimRow) {
      return undefined;
    }

    const evidenceRows = await this.db
      .selectFrom('claim_evidence')
      .innerJoin('evidence_items', 'evidence_items.id', 'claim_evidence.evidence_id')
      .selectAll('evidence_items')
      .where('claim_evidence.claim_id', '=', id)
      .orderBy('evidence_items.collected_at', 'desc')
      .execute();

    return {
      ...mapClaim(claimRow),
      evidence: evidenceRows.map(mapEvidence),
    };
  }

  async listClaims(filters?: ClaimFilters): Promise<Claim[]> {
    let query = this.db
      .selectFrom('claims')
      .selectAll()
      .orderBy('created_at', 'desc');

    if (filters?.serviceId) {
      query = query.where('service_id', '=', filters.serviceId);
    }
    if (filters?.section) {
      query = query.where('section', '=', filters.section);
    }
    if (filters?.status) {
      query = query.where('status', '=', filters.status);
    }

    const rows = await query.execute();
    return rows.map(mapClaim);
  }

  async upsertClaim(input: UpsertClaimInput): Promise<Claim> {
    if (input.id) {
      const row = await this.db
        .updateTable('claims')
        .set({
          service_id: input.serviceId,
          title: input.title,
          section: input.section,
          status: input.status ?? 'UNKNOWN',
          confidence: input.confidence ?? 0,
          reason: input.reason ?? null,
          updated_at: sql`NOW()`,
        })
        .where('id', '=', input.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      if (input.evidenceIds) {
        await this.replaceEvidenceLinks(input.id, input.evidenceIds);
      }

      return mapClaim(row);
    }

    const row = await this.db
      .insertInto('claims')
      .values({
        service_id: input.serviceId,
        title: input.title,
        section: input.section,
        status: input.status ?? 'UNKNOWN',
        confidence: input.confidence ?? 0,
        reason: input.reason ?? null,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    if (input.evidenceIds && input.evidenceIds.length > 0) {
      await this.linkEvidence(row.id, input.evidenceIds);
    }

    return mapClaim(row);
  }

  async linkEvidence(claimId: number, evidenceIds: number[]): Promise<void> {
    if (evidenceIds.length === 0) return;

    await this.db
      .insertInto('claim_evidence')
      .values(
        evidenceIds.map((evidenceId) => ({
          claim_id: claimId,
          evidence_id: evidenceId,
        }))
      )
      .onConflict((oc) => oc.doNothing())
      .execute();
  }

  async unlinkEvidence(claimId: number, evidenceIds: number[]): Promise<void> {
    if (evidenceIds.length === 0) return;

    await this.db
      .deleteFrom('claim_evidence')
      .where('claim_id', '=', claimId)
      .where('evidence_id', 'in', evidenceIds)
      .execute();
  }

  async deleteClaim(id: number): Promise<void> {
    await this.db
      .deleteFrom('claims')
      .where('id', '=', id)
      .execute();
  }

  private async replaceEvidenceLinks(
    claimId: number,
    evidenceIds: number[]
  ): Promise<void> {
    await this.db
      .deleteFrom('claim_evidence')
      .where('claim_id', '=', claimId)
      .execute();

    if (evidenceIds.length > 0) {
      await this.linkEvidence(claimId, evidenceIds);
    }
  }
}

function mapClaim(row: Selectable<ClaimRow>): Claim {
  return {
    id: row.id,
    serviceId: row.service_id,
    title: row.title,
    section: row.section,
    status: row.status,
    confidence: row.confidence,
    reason: row.reason ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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
