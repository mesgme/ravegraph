import type { ReadinessScore } from '../types.js';

export interface ReadinessFilters {
  serviceId?: string;
  daysBack?: number;
}

export interface ReadinessRepository {
  getScores(filters?: ReadinessFilters): Promise<ReadinessScore[]>;
  getAverageScore(): Promise<number>;
  getTrackedServicesCount(): Promise<number>;
}
