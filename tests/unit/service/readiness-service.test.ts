import { describe, it, expect, vi } from 'vitest';
import { ReadinessService } from '../../../src/service/readiness-service.js';
import type { ReadinessRepository } from '../../../src/domain/ports/readiness-repository.js';
import type { ReadinessScore } from '../../../src/domain/types.js';

function makeScore(overrides: Partial<ReadinessScore> = {}): ReadinessScore {
  return {
    id: 1,
    serviceId: 'api-service',
    serviceName: 'API Service',
    score: 85,
    recordedAt: new Date('2026-02-10'),
    createdAt: new Date('2026-02-10'),
    ...overrides,
  };
}

function mockRepo(
  scores: ReadinessScore[] = [],
  avgScore = 0,
  servicesCount = 0
): ReadinessRepository {
  return {
    getScores: vi.fn().mockResolvedValue(scores),
    getAverageScore: vi.fn().mockResolvedValue(avgScore),
    getTrackedServicesCount: vi.fn().mockResolvedValue(servicesCount),
  };
}

describe('ReadinessService', () => {
  describe('getTrends', () => {
    it('returns empty array when no scores', async () => {
      const repo = mockRepo();
      const service = new ReadinessService(repo);
      const trends = await service.getTrends();
      expect(trends).toEqual([]);
    });

    it('returns NEW when only one score for a service', async () => {
      const scores = [makeScore({ serviceId: 'svc-1', score: 80 })];
      const repo = mockRepo(scores);
      const service = new ReadinessService(repo);
      const trends = await service.getTrends();
      expect(trends).toHaveLength(1);
      expect(trends[0].trend).toBe('NEW');
      expect(trends[0].currentScore).toBe(80);
      expect(trends[0].previousScore).toBeUndefined();
    });

    it('returns IMPROVING when score increased by more than threshold', async () => {
      const scores = [
        makeScore({
          id: 2,
          serviceId: 'svc-1',
          score: 90,
          recordedAt: new Date('2026-02-12'),
        }),
        makeScore({
          id: 1,
          serviceId: 'svc-1',
          score: 80,
          recordedAt: new Date('2026-02-10'),
        }),
      ];
      const repo = mockRepo(scores);
      const service = new ReadinessService(repo);
      const trends = await service.getTrends();
      expect(trends[0].trend).toBe('IMPROVING');
      expect(trends[0].currentScore).toBe(90);
      expect(trends[0].previousScore).toBe(80);
    });

    it('returns DECLINING when score dropped by more than threshold', async () => {
      const scores = [
        makeScore({
          id: 2,
          serviceId: 'svc-1',
          score: 70,
          recordedAt: new Date('2026-02-12'),
        }),
        makeScore({
          id: 1,
          serviceId: 'svc-1',
          score: 80,
          recordedAt: new Date('2026-02-10'),
        }),
      ];
      const repo = mockRepo(scores);
      const service = new ReadinessService(repo);
      const trends = await service.getTrends();
      expect(trends[0].trend).toBe('DECLINING');
    });

    it('returns STABLE when score changed by less than or equal to threshold', async () => {
      const scores = [
        makeScore({
          id: 2,
          serviceId: 'svc-1',
          score: 80.5,
          recordedAt: new Date('2026-02-12'),
        }),
        makeScore({
          id: 1,
          serviceId: 'svc-1',
          score: 80,
          recordedAt: new Date('2026-02-10'),
        }),
      ];
      const repo = mockRepo(scores);
      const service = new ReadinessService(repo);
      const trends = await service.getTrends();
      expect(trends[0].trend).toBe('STABLE');
    });

    it('groups scores by serviceId', async () => {
      const scores = [
        makeScore({
          id: 3,
          serviceId: 'svc-a',
          serviceName: 'A',
          score: 90,
          recordedAt: new Date('2026-02-12'),
        }),
        makeScore({
          id: 1,
          serviceId: 'svc-a',
          serviceName: 'A',
          score: 80,
          recordedAt: new Date('2026-02-10'),
        }),
        makeScore({
          id: 2,
          serviceId: 'svc-b',
          serviceName: 'B',
          score: 50,
          recordedAt: new Date('2026-02-11'),
        }),
      ];
      const repo = mockRepo(scores);
      const service = new ReadinessService(repo);
      const trends = await service.getTrends();
      expect(trends).toHaveLength(2);
      const trendA = trends.find((t) => t.serviceId === 'svc-a');
      const trendB = trends.find((t) => t.serviceId === 'svc-b');
      expect(trendA?.trend).toBe('IMPROVING');
      expect(trendB?.trend).toBe('NEW');
    });
  });
});
