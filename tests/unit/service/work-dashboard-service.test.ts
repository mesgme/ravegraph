import { describe, it, expect, vi } from 'vitest';
import { WorkDashboardService } from '../../../src/service/work-dashboard-service.js';
import type { ControlRepository } from '../../../src/domain/ports/control-repository.js';
import type { WorkItemRepository } from '../../../src/domain/ports/work-item-repository.js';
import type { ReadinessRepository } from '../../../src/domain/ports/readiness-repository.js';
import type { Control, WorkItem } from '../../../src/domain/types.js';

function mockControlRepo(
  controls: Control[] = [],
  counts = {
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    byStatus: {} as Record<string, number>,
  }
): ControlRepository {
  return {
    getControls: vi.fn().mockResolvedValue(controls),
    getControlCounts: vi.fn().mockResolvedValue(counts),
  };
}

function mockWorkItemRepo(
  items: WorkItem[] = [],
  counts = {
    byStatus: {} as Record<string, number>,
    byType: {} as Record<string, number>,
  }
): WorkItemRepository {
  return {
    getWorkItems: vi.fn().mockResolvedValue(items),
    getWorkItemCounts: vi.fn().mockResolvedValue(counts),
  };
}

function mockReadinessRepo(): ReadinessRepository {
  return {
    getScores: vi.fn().mockResolvedValue([]),
    getAverageScore: vi.fn().mockResolvedValue(75),
    getTrackedServicesCount: vi.fn().mockResolvedValue(3),
  };
}

describe('WorkDashboardService', () => {
  it('assembles a complete dashboard', async () => {
    const controlRepo = mockControlRepo();
    const workItemRepo = mockWorkItemRepo();
    const readinessRepo = mockReadinessRepo();

    const svc = new WorkDashboardService(
      controlRepo,
      workItemRepo,
      readinessRepo
    );

    const dashboard = await svc.getDashboard();

    expect(dashboard.resilienceBacklog).toBeDefined();
    expect(dashboard.incidentWork).toBeDefined();
    expect(dashboard.readinessTrends).toBeDefined();
    expect(dashboard.summary.avgReadinessScore).toBe(75);
    expect(dashboard.summary.servicesTracked).toBe(3);
  });

  it('passes serviceId filter to all repos', async () => {
    const controlRepo = mockControlRepo();
    const workItemRepo = mockWorkItemRepo();
    const readinessRepo = mockReadinessRepo();

    const svc = new WorkDashboardService(
      controlRepo,
      workItemRepo,
      readinessRepo
    );

    await svc.getDashboard({ serviceId: 'api-service' });

    expect(controlRepo.getControls).toHaveBeenCalledWith({
      serviceId: 'api-service',
    });
    expect(workItemRepo.getWorkItems).toHaveBeenCalledWith({
      serviceId: 'api-service',
    });
    expect(readinessRepo.getScores).toHaveBeenCalledWith({
      serviceId: 'api-service',
    });
  });
});
