import type { Claim, ClaimStatus, ClaimWithEvidence } from '../types.js';

export interface ClaimFilters {
  serviceId?: string;
  section?: string;
  status?: ClaimStatus;
}

export interface UpsertClaimInput {
  id?: number;
  serviceId: string;
  title: string;
  section: string;
  status?: ClaimStatus;
  confidence?: number;
  reason?: string;
  evidenceIds?: number[];
}

export interface ClaimRepository {
  getClaim(id: number): Promise<ClaimWithEvidence | undefined>;
  listClaims(filters?: ClaimFilters): Promise<Claim[]>;
  upsertClaim(input: UpsertClaimInput): Promise<Claim>;
  linkEvidence(claimId: number, evidenceIds: number[]): Promise<void>;
  unlinkEvidence(claimId: number, evidenceIds: number[]): Promise<void>;
  deleteClaim(id: number): Promise<void>;
}
