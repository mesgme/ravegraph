import type { EvidenceItem, EvidenceType } from '../types.js';

export interface EvidenceFilters {
  serviceId?: string;
  evidenceType?: EvidenceType;
  tags?: string[];
  freshOnly?: boolean;
}

export interface UpsertEvidenceInput {
  id?: number;
  serviceId: string;
  evidenceType: EvidenceType;
  source: string;
  body: Record<string, unknown>;
  tags?: string[];
  confidence: number;
  ttlHours?: number;
  collectedAt?: Date;
}

export interface EvidenceRepository {
  getEvidence(id: number): Promise<EvidenceItem | undefined>;
  searchEvidence(filters?: EvidenceFilters): Promise<EvidenceItem[]>;
  upsertEvidence(input: UpsertEvidenceInput): Promise<EvidenceItem>;
  deleteEvidence(id: number): Promise<void>;
}
