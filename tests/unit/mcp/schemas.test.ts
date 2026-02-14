import { describe, it, expect } from 'vitest';
import {
  resilienceBacklogSchema,
  incidentWorkSchema,
  readinessTrendsSchema,
  workDashboardSchema,
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
});
