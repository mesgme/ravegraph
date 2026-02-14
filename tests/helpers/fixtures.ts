import type {
  Control,
  WorkItem,
  ReadinessScore,
} from '../../src/domain/types.js';

export function makeControl(overrides: Partial<Control> = {}): Control {
  return {
    id: 1,
    controlType: 'PREVENT',
    title: 'Test Control',
    status: 'PROPOSED',
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-10'),
    ...overrides,
  };
}

export function makeWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  return {
    id: 1,
    title: 'Test Work Item',
    status: 'OPEN',
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-10'),
    ...overrides,
  };
}

export function makeReadinessScore(
  overrides: Partial<ReadinessScore> = {}
): ReadinessScore {
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
