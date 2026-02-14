import type {
  ReadinessRepository,
  ReadinessFilters,
} from '../domain/ports/readiness-repository.js';
import type {
  ReadinessScore,
  ReadinessTrend,
  TrendDirection,
} from '../domain/types.js';
import { TREND_THRESHOLD } from '../domain/constants.js';

export class ReadinessService {
  constructor(private readonly repo: ReadinessRepository) {}

  async getTrends(filters?: ReadinessFilters): Promise<ReadinessTrend[]> {
    const scores = await this.repo.getScores(filters);
    return this.buildTrends(scores);
  }

  async getAverageScore(): Promise<number> {
    return this.repo.getAverageScore();
  }

  async getTrackedServicesCount(): Promise<number> {
    return this.repo.getTrackedServicesCount();
  }

  private buildTrends(scores: ReadinessScore[]): ReadinessTrend[] {
    const serviceScores = new Map<string, ReadinessScore[]>();

    for (const score of scores) {
      const existing = serviceScores.get(score.serviceId);
      if (existing) {
        existing.push(score);
      } else {
        serviceScores.set(score.serviceId, [score]);
      }
    }

    const trends: ReadinessTrend[] = [];

    for (const [, groupedScores] of serviceScores) {
      if (groupedScores.length === 0) continue;

      const current = groupedScores[0];
      const previous = groupedScores.length > 1 ? groupedScores[1] : undefined;

      let trend: TrendDirection = 'NEW';
      if (previous) {
        const diff = current.score - previous.score;
        if (diff > TREND_THRESHOLD) trend = 'IMPROVING';
        else if (diff < -TREND_THRESHOLD) trend = 'DECLINING';
        else trend = 'STABLE';
      }

      trends.push({
        serviceId: current.serviceId,
        serviceName: current.serviceName,
        currentScore: current.score,
        previousScore: previous?.score,
        trend,
        scores: groupedScores,
      });
    }

    return trends;
  }
}
