import type {
  EvidenceRepository,
  EvidenceFilters,
  UpsertEvidenceInput,
} from '../domain/ports/evidence-repository.js';
import type { EvidenceItem } from '../domain/types.js';
import { NotFoundError } from '../domain/errors.js';

export class EvidenceService {
  constructor(private readonly repo: EvidenceRepository) {}

  async getEvidence(id: number): Promise<EvidenceItem> {
    const evidence = await this.repo.getEvidence(id);
    if (!evidence) {
      throw new NotFoundError('EvidenceItem', id);
    }
    return evidence;
  }

  async searchEvidence(filters?: EvidenceFilters): Promise<EvidenceItem[]> {
    return this.repo.searchEvidence(filters);
  }

  async upsertEvidence(input: UpsertEvidenceInput): Promise<EvidenceItem> {
    return this.repo.upsertEvidence(input);
  }

  async deleteEvidence(id: number): Promise<void> {
    return this.repo.deleteEvidence(id);
  }
}
