import { describe, it, expect, vi } from 'vitest';
import { ClaimService } from '../../../src/service/claim-service.js';
import type { ClaimRepository } from '../../../src/domain/ports/claim-repository.js';
import { makeClaim, makeClaimWithEvidence } from '../../helpers/fixtures.js';
import { NotFoundError } from '../../../src/domain/errors.js';

function mockRepo(overrides: Partial<ClaimRepository> = {}): ClaimRepository {
  return {
    getClaim: vi.fn().mockResolvedValue(undefined),
    listClaims: vi.fn().mockResolvedValue([]),
    upsertClaim: vi.fn().mockResolvedValue(makeClaim()),
    linkEvidence: vi.fn().mockResolvedValue(undefined),
    unlinkEvidence: vi.fn().mockResolvedValue(undefined),
    deleteClaim: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('ClaimService', () => {
  describe('getClaim', () => {
    it('returns claim with evidence when found', async () => {
      const claim = makeClaimWithEvidence({ id: 42 });
      const repo = mockRepo({
        getClaim: vi.fn().mockResolvedValue(claim),
      });
      const service = new ClaimService(repo);

      const result = await service.getClaim(42);

      expect(result).toEqual(claim);
      expect(repo.getClaim).toHaveBeenCalledWith(42);
    });

    it('throws NotFoundError when not found', async () => {
      const repo = mockRepo();
      const service = new ClaimService(repo);

      await expect(service.getClaim(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('listClaims', () => {
    it('returns empty array when no claims', async () => {
      const repo = mockRepo();
      const service = new ClaimService(repo);

      const result = await service.listClaims();

      expect(result).toEqual([]);
    });

    it('passes filters to repo', async () => {
      const claims = [makeClaim()];
      const repo = mockRepo({
        listClaims: vi.fn().mockResolvedValue(claims),
      });
      const service = new ClaimService(repo);
      const filters = { serviceId: 'api-service', status: 'PASS' as const };

      const result = await service.listClaims(filters);

      expect(result).toEqual(claims);
      expect(repo.listClaims).toHaveBeenCalledWith(filters);
    });
  });

  describe('upsertClaim', () => {
    it('delegates to repo and returns result', async () => {
      const claim = makeClaim({ id: 5 });
      const repo = mockRepo({
        upsertClaim: vi.fn().mockResolvedValue(claim),
      });
      const service = new ClaimService(repo);
      const input = {
        serviceId: 'api-service',
        title: 'Has monitoring',
        section: 'monitoring',
      };

      const result = await service.upsertClaim(input);

      expect(result).toEqual(claim);
      expect(repo.upsertClaim).toHaveBeenCalledWith(input);
    });
  });

  describe('deleteClaim', () => {
    it('delegates to repo', async () => {
      const repo = mockRepo();
      const service = new ClaimService(repo);

      await service.deleteClaim(1);

      expect(repo.deleteClaim).toHaveBeenCalledWith(1);
    });
  });
});
