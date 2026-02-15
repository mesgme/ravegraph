import { describe, it, expect, vi } from 'vitest';
import { EvidenceService } from '../../../src/service/evidence-service.js';
import type { EvidenceRepository } from '../../../src/domain/ports/evidence-repository.js';
import { makeEvidenceItem } from '../../helpers/fixtures.js';
import { NotFoundError } from '../../../src/domain/errors.js';

function mockRepo(
  overrides: Partial<EvidenceRepository> = {}
): EvidenceRepository {
  return {
    getEvidence: vi.fn().mockResolvedValue(undefined),
    searchEvidence: vi.fn().mockResolvedValue([]),
    upsertEvidence: vi.fn().mockResolvedValue(makeEvidenceItem()),
    deleteEvidence: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('EvidenceService', () => {
  describe('getEvidence', () => {
    it('returns evidence when found', async () => {
      const evidence = makeEvidenceItem({ id: 42 });
      const repo = mockRepo({
        getEvidence: vi.fn().mockResolvedValue(evidence),
      });
      const service = new EvidenceService(repo);

      const result = await service.getEvidence(42);

      expect(result).toEqual(evidence);
      expect(repo.getEvidence).toHaveBeenCalledWith(42);
    });

    it('throws NotFoundError when not found', async () => {
      const repo = mockRepo();
      const service = new EvidenceService(repo);

      await expect(service.getEvidence(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('searchEvidence', () => {
    it('returns empty array when no evidence matches', async () => {
      const repo = mockRepo();
      const service = new EvidenceService(repo);

      const result = await service.searchEvidence();

      expect(result).toEqual([]);
    });

    it('passes filters to repo', async () => {
      const evidence = [makeEvidenceItem()];
      const repo = mockRepo({
        searchEvidence: vi.fn().mockResolvedValue(evidence),
      });
      const service = new EvidenceService(repo);
      const filters = { serviceId: 'api-service', evidenceType: 'MONITORING' as const };

      const result = await service.searchEvidence(filters);

      expect(result).toEqual(evidence);
      expect(repo.searchEvidence).toHaveBeenCalledWith(filters);
    });
  });

  describe('upsertEvidence', () => {
    it('delegates to repo and returns result', async () => {
      const evidence = makeEvidenceItem({ id: 5 });
      const repo = mockRepo({
        upsertEvidence: vi.fn().mockResolvedValue(evidence),
      });
      const service = new EvidenceService(repo);
      const input = {
        serviceId: 'api-service',
        evidenceType: 'MONITORING' as const,
        source: 'manual',
        body: { status: 'healthy' },
        confidence: 80,
      };

      const result = await service.upsertEvidence(input);

      expect(result).toEqual(evidence);
      expect(repo.upsertEvidence).toHaveBeenCalledWith(input);
    });
  });

  describe('deleteEvidence', () => {
    it('delegates to repo', async () => {
      const repo = mockRepo();
      const service = new EvidenceService(repo);

      await service.deleteEvidence(1);

      expect(repo.deleteEvidence).toHaveBeenCalledWith(1);
    });
  });
});
