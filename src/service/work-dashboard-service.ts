import type { ControlRepository } from '../domain/ports/control-repository.js';
import type { WorkItemRepository } from '../domain/ports/work-item-repository.js';
import type { ReadinessRepository } from '../domain/ports/readiness-repository.js';
import type { WorkDashboard } from '../domain/types.js';
import { ReadinessService } from './readiness-service.js';

export interface DashboardFilters {
  serviceId?: string;
}

export class WorkDashboardService {
  private readonly readinessService: ReadinessService;

  constructor(
    private readonly controlRepo: ControlRepository,
    private readonly workItemRepo: WorkItemRepository,
    readinessRepo: ReadinessRepository
  ) {
    this.readinessService = new ReadinessService(readinessRepo);
  }

  async getDashboard(filters?: DashboardFilters): Promise<WorkDashboard> {
    const serviceFilter = filters?.serviceId
      ? { serviceId: filters.serviceId }
      : undefined;

    const [
      controls,
      controlCounts,
      workItems,
      workItemCounts,
      readinessTrends,
      avgScore,
      servicesCount,
    ] = await Promise.all([
      this.controlRepo.getControls(serviceFilter),
      this.controlRepo.getControlCounts(),
      this.workItemRepo.getWorkItems(serviceFilter),
      this.workItemRepo.getWorkItemCounts(),
      this.readinessService.getTrends(serviceFilter),
      this.readinessService.getAverageScore(),
      this.readinessService.getTrackedServicesCount(),
    ]);

    return {
      resilienceBacklog: {
        controls,
        countByType: controlCounts.byType,
        countByPriority: controlCounts.byPriority,
        countByStatus: controlCounts.byStatus,
      },
      incidentWork: {
        workItems,
        countByStatus: workItemCounts.byStatus,
        countByType: workItemCounts.byType,
      },
      readinessTrends,
      summary: {
        totalControls: controls.length,
        totalWorkItems: workItems.length,
        servicesTracked: servicesCount,
        avgReadinessScore: avgScore,
      },
    };
  }
}
