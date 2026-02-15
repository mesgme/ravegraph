import type {
  Control,
  WorkItem,
  ReadinessScore,
  EvidenceItem,
  Claim,
  ClaimWithEvidence,
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

export function makeEvidenceItem(
  overrides: Partial<EvidenceItem> = {}
): EvidenceItem {
  return {
    id: 1,
    serviceId: 'api-service',
    evidenceType: 'MONITORING',
    source: 'manual',
    body: { status: 'healthy' },
    tags: [],
    confidence: 80,
    collectedAt: new Date('2026-02-10'),
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-10'),
    ...overrides,
  };
}

export function makeClaim(overrides: Partial<Claim> = {}): Claim {
  return {
    id: 1,
    serviceId: 'api-service',
    title: 'Has monitoring',
    section: 'monitoring',
    status: 'UNKNOWN',
    confidence: 0,
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-02-10'),
    ...overrides,
  };
}

export function makeClaimWithEvidence(
  overrides: Partial<ClaimWithEvidence> = {}
): ClaimWithEvidence {
  return {
    ...makeClaim(),
    evidence: [],
    ...overrides,
  };
}
