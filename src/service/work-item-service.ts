import type {
  WorkItemRepository,
  WorkItemFilters,
  WorkItemCounts,
} from '../domain/ports/work-item-repository.js';
import type { WorkItem } from '../domain/types.js';

export class WorkItemService {
  constructor(private readonly repo: WorkItemRepository) {}

  async getWorkItems(filters?: WorkItemFilters): Promise<WorkItem[]> {
    return this.repo.getWorkItems(filters);
  }

  async getWorkItemCounts(): Promise<WorkItemCounts> {
    return this.repo.getWorkItemCounts();
  }
}
