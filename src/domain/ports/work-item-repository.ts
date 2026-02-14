import type { WorkItem, WorkStatus, WorkType } from '../types.js';

export interface WorkItemFilters {
  serviceId?: string;
  status?: WorkStatus;
  controlId?: number;
}

export interface WorkItemCounts {
  byStatus: Record<WorkStatus, number>;
  byType: Record<WorkType, number>;
}

export interface WorkItemRepository {
  getWorkItems(filters?: WorkItemFilters): Promise<WorkItem[]>;
  getWorkItemCounts(): Promise<WorkItemCounts>;
}
