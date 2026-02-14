import type {
  Control,
  ControlStatus,
  ControlType,
  Priority,
} from '../types.js';

export interface ControlFilters {
  serviceId?: string;
  status?: ControlStatus;
  priority?: Priority;
}

export interface ControlCounts {
  byType: Record<ControlType, number>;
  byPriority: Record<Priority, number>;
  byStatus: Record<ControlStatus, number>;
}

export interface ControlRepository {
  getControls(filters?: ControlFilters): Promise<Control[]>;
  getControlCounts(): Promise<ControlCounts>;
}
