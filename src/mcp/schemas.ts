import { z } from 'zod/v4';

export const resilienceBacklogSchema = z.object({
  serviceId: z.string().optional(),
  status: z
    .enum(['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
});

export const incidentWorkSchema = z.object({
  serviceId: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED']).optional(),
  controlId: z.number().int().optional(),
});

export const readinessTrendsSchema = z.object({
  serviceId: z.string().optional(),
  daysBack: z.number().int().min(1).optional(),
});

export const workDashboardSchema = z.object({
  serviceId: z.string().optional(),
});

// Evidence Ledger schemas (Issue #3)

const evidenceTypeEnum = z.enum([
  'SBOM',
  'VULNERABILITY_SCAN',
  'MONITORING',
  'TESTING',
  'DEPLOYMENT',
  'PROVENANCE',
  'CONFIGURATION',
  'OTHER',
]);

const claimStatusEnum = z.enum(['PASS', 'PARTIAL', 'FAIL', 'UNKNOWN']);

export const upsertEvidenceSchema = z.object({
  id: z.number().int().optional(),
  serviceId: z.string(),
  evidenceType: evidenceTypeEnum,
  source: z.string(),
  body: z.record(z.string(), z.unknown()),
  confidence: z.number().int().min(0).max(100),
  tags: z.array(z.string()).optional(),
  ttlHours: z.number().int().optional(),
  collectedAt: z.string().optional(),
});

export const getEvidenceSchema = z.object({
  id: z.number().int(),
});

export const searchEvidenceSchema = z.object({
  serviceId: z.string().optional(),
  evidenceType: evidenceTypeEnum.optional(),
  tags: z.array(z.string()).optional(),
  freshOnly: z.boolean().optional(),
});

export const upsertClaimSchema = z.object({
  id: z.number().int().optional(),
  serviceId: z.string(),
  title: z.string(),
  section: z.string(),
  status: claimStatusEnum.optional(),
  confidence: z.number().int().min(0).max(100).optional(),
  reason: z.string().optional(),
  evidenceIds: z.array(z.number().int()).optional(),
});

export const getClaimSchema = z.object({
  id: z.number().int(),
});

export const listClaimsSchema = z.object({
  serviceId: z.string().optional(),
  section: z.string().optional(),
  status: claimStatusEnum.optional(),
});
