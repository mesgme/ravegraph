import type {
  ControlRepository,
  ControlFilters,
  ControlCounts,
} from '../domain/ports/control-repository.js';
import type { Control } from '../domain/types.js';

export class ControlService {
  constructor(private readonly repo: ControlRepository) {}

  async getControls(filters?: ControlFilters): Promise<Control[]> {
    return this.repo.getControls(filters);
  }

  async getControlCounts(): Promise<ControlCounts> {
    return this.repo.getControlCounts();
  }
}
