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
