import { describe, it, expect } from 'vitest';
import {
  resilienceBacklogSchema,
  incidentWorkSchema,
  readinessTrendsSchema,
  workDashboardSchema,
  upsertEvidenceSchema,
  getEvidenceSchema,
  searchEvidenceSchema,
  upsertClaimSchema,
  getClaimSchema,
  listClaimsSchema,
} from '../../../src/mcp/schemas.js';

describe('MCP input schemas', () => {
  describe('resilienceBacklogSchema', () => {
    it('accepts empty object', () => {
      const result = resilienceBacklogSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts valid filters', () => {
      const result = resilienceBacklogSchema.safeParse({
        serviceId: 'api-service',
        status: 'PROPOSED',
        priority: 'HIGH',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = resilienceBacklogSchema.safeParse({
        status: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid priority', () => {
      const result = resilienceBacklogSchema.safeParse({
        priority: 'SUPER_HIGH',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('incidentWorkSchema', () => {
    it('accepts valid filters', () => {
      const result = incidentWorkSchema.safeParse({
        serviceId: 'api-service',
        status: 'OPEN',
        controlId: 5,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = incidentWorkSchema.safeParse({ status: 'PENDING' });
      expect(result.success).toBe(false);
    });
  });

  describe('readinessTrendsSchema', () => {
    it('accepts daysBack as number', () => {
      const result = readinessTrendsSchema.safeParse({ daysBack: 7 });
      expect(result.success).toBe(true);
    });

    it('rejects negative daysBack', () => {
      const result = readinessTrendsSchema.safeParse({ daysBack: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('workDashboardSchema', () => {
    it('accepts optional serviceId', () => {
      const result = workDashboardSchema.safeParse({
        serviceId: 'web-service',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('upsertEvidenceSchema', () => {
    it('accepts valid evidence input', () => {
      const result = upsertEvidenceSchema.safeParse({
        serviceId: 'api-service',
        evidenceType: 'MONITORING',
        source: 'prometheus',
        body: { status: 'healthy' },
        confidence: 80,
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional fields', () => {
      const result = upsertEvidenceSchema.safeParse({
        id: 1,
        serviceId: 'api-service',
        evidenceType: 'SBOM',
        source: 'syft',
        body: { packages: [] },
        confidence: 95,
        tags: ['production', 'auto'],
        ttlHours: 24,
        collectedAt: '2026-02-10T00:00:00Z',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = upsertEvidenceSchema.safeParse({
        serviceId: 'api-service',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid evidence type', () => {
      const result = upsertEvidenceSchema.safeParse({
        serviceId: 'api-service',
        evidenceType: 'INVALID',
        source: 'test',
        body: {},
        confidence: 80,
      });
      expect(result.success).toBe(false);
    });

    it('rejects confidence out of range', () => {
      const under = upsertEvidenceSchema.safeParse({
        serviceId: 'api-service',
        evidenceType: 'MONITORING',
        source: 'test',
        body: {},
        confidence: -1,
      });
      const over = upsertEvidenceSchema.safeParse({
        serviceId: 'api-service',
        evidenceType: 'MONITORING',
        source: 'test',
        body: {},
        confidence: 101,
      });
      expect(under.success).toBe(false);
      expect(over.success).toBe(false);
    });
  });

  describe('getEvidenceSchema', () => {
    it('accepts valid id', () => {
      const result = getEvidenceSchema.safeParse({ id: 1 });
      expect(result.success).toBe(true);
    });

    it('rejects missing id', () => {
      const result = getEvidenceSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('searchEvidenceSchema', () => {
    it('accepts empty object', () => {
      const result = searchEvidenceSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts all filters', () => {
      const result = searchEvidenceSchema.safeParse({
        serviceId: 'api-service',
        evidenceType: 'MONITORING',
        tags: ['production'],
        freshOnly: true,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid evidence type', () => {
      const result = searchEvidenceSchema.safeParse({
        evidenceType: 'INVALID',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('upsertClaimSchema', () => {
    it('accepts valid claim input', () => {
      const result = upsertClaimSchema.safeParse({
        serviceId: 'api-service',
        title: 'Has monitoring',
        section: 'monitoring',
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional fields', () => {
      const result = upsertClaimSchema.safeParse({
        id: 1,
        serviceId: 'api-service',
        title: 'Has monitoring',
        section: 'monitoring',
        status: 'PASS',
        confidence: 90,
        reason: 'Prometheus is configured',
        evidenceIds: [1, 2],
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = upsertClaimSchema.safeParse({
        serviceId: 'api-service',
      });
      expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
      const result = upsertClaimSchema.safeParse({
        serviceId: 'api-service',
        title: 'Test',
        section: 'test',
        status: 'INVALID',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('getClaimSchema', () => {
    it('accepts valid id', () => {
      const result = getClaimSchema.safeParse({ id: 1 });
      expect(result.success).toBe(true);
    });

    it('rejects missing id', () => {
      const result = getClaimSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('listClaimsSchema', () => {
    it('accepts empty object', () => {
      const result = listClaimsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('accepts all filters', () => {
      const result = listClaimsSchema.safeParse({
        serviceId: 'api-service',
        section: 'monitoring',
        status: 'PASS',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
      const result = listClaimsSchema.safeParse({ status: 'INVALID' });
      expect(result.success).toBe(false);
    });
  });
});
