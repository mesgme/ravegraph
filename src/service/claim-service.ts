import type {
  ClaimRepository,
  ClaimFilters,
  UpsertClaimInput,
} from '../domain/ports/claim-repository.js';
import type { Claim, ClaimWithEvidence } from '../domain/types.js';
import { NotFoundError } from '../domain/errors.js';

export class ClaimService {
  constructor(private readonly repo: ClaimRepository) {}

  async getClaim(id: number): Promise<ClaimWithEvidence> {
    const claim = await this.repo.getClaim(id);
    if (!claim) {
      throw new NotFoundError('Claim', id);
    }
    return claim;
  }

  async listClaims(filters?: ClaimFilters): Promise<Claim[]> {
    return this.repo.listClaims(filters);
  }

  async upsertClaim(input: UpsertClaimInput): Promise<Claim> {
    return this.repo.upsertClaim(input);
  }

  async deleteClaim(id: number): Promise<void> {
    return this.repo.deleteClaim(id);
  }
}
