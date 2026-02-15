#!/usr/bin/env node

import { Command } from 'commander';
import type { ControlService } from '../service/control-service.js';
import type { WorkItemService } from '../service/work-item-service.js';
import type { ReadinessService } from '../service/readiness-service.js';
import type { WorkDashboardService } from '../service/work-dashboard-service.js';
import type { EvidenceService } from '../service/evidence-service.js';
import type { ClaimService } from '../service/claim-service.js';
import { DomainError } from '../domain/errors.js';

export interface CliDeps {
  controlService: ControlService;
  workItemService: WorkItemService;
  readinessService: ReadinessService;
  dashboardService: WorkDashboardService;
  evidenceService: EvidenceService;
  claimService: ClaimService;
  testConnection: () => Promise<boolean>;
}

export function createCli(deps: CliDeps): Command {
  const program = new Command();

  program
    .name('rave')
    .description('Ravegraph CLI - Work Dashboard for SRE consulting')
    .version('0.1.0');

  program
    .command('dashboard')
    .alias('d')
    .description('Get full work dashboard (optionally filtered by service)')
    .argument('[serviceId]', 'Service ID to filter by')
    .action(async (serviceId?: string) => {
      await ensureDatabase(deps);
      try {
        const dashboard = await deps.dashboardService.getDashboard(
          serviceId ? { serviceId } : undefined
        );
        console.log(JSON.stringify(dashboard, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  program
    .command('controls')
    .alias('c')
    .description('Get resilience backlog controls')
    .action(async () => {
      await ensureDatabase(deps);
      try {
        const controls = await deps.controlService.getControls();
        console.log(JSON.stringify(controls, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  program
    .command('work')
    .alias('w')
    .description('Get incident-derived work items')
    .action(async () => {
      await ensureDatabase(deps);
      try {
        const workItems = await deps.workItemService.getWorkItems();
        console.log(JSON.stringify(workItems, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  program
    .command('trends')
    .alias('t')
    .description('Get readiness trends')
    .action(async () => {
      await ensureDatabase(deps);
      try {
        const trends = await deps.readinessService.getTrends();
        console.log(JSON.stringify(trends, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  // Evidence commands
  const evidence = program
    .command('evidence')
    .alias('e')
    .description('Manage evidence items');

  evidence
    .command('add')
    .description('Add or update an evidence item')
    .requiredOption('--service-id <serviceId>', 'Service ID')
    .requiredOption(
      '--type <type>',
      'Evidence type (SBOM, VULNERABILITY_SCAN, MONITORING, TESTING, DEPLOYMENT, PROVENANCE, CONFIGURATION, OTHER)'
    )
    .requiredOption('--source <source>', 'Source of evidence')
    .requiredOption('--body <json>', 'Evidence body (JSON string)')
    .requiredOption('--confidence <n>', 'Confidence score 0-100')
    .option('--id <n>', 'Evidence ID (for updates)')
    .option('--tags <tags...>', 'Tags')
    .option('--ttl-hours <n>', 'TTL in hours')
    .action(async (opts) => {
      await ensureDatabase(deps);
      try {
        const result = await deps.evidenceService.upsertEvidence({
          id: opts.id ? parseInt(opts.id) : undefined,
          serviceId: opts.serviceId,
          evidenceType: opts.type,
          source: opts.source,
          body: JSON.parse(opts.body),
          confidence: parseInt(opts.confidence),
          tags: opts.tags,
          ttlHours: opts.ttlHours ? parseInt(opts.ttlHours) : undefined,
        });
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  evidence
    .command('get')
    .description('Get an evidence item by ID')
    .argument('<id>', 'Evidence item ID')
    .action(async (id: string) => {
      await ensureDatabase(deps);
      try {
        const result = await deps.evidenceService.getEvidence(parseInt(id));
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  evidence
    .command('search')
    .description('Search evidence items')
    .option('--service-id <serviceId>', 'Filter by service ID')
    .option('--type <type>', 'Filter by evidence type')
    .option('--tags <tags...>', 'Filter by tags (any match)')
    .option('--fresh-only', 'Only show non-expired evidence')
    .action(async (opts) => {
      await ensureDatabase(deps);
      try {
        const results = await deps.evidenceService.searchEvidence({
          serviceId: opts.serviceId,
          evidenceType: opts.type,
          tags: opts.tags,
          freshOnly: opts.freshOnly,
        });
        console.log(JSON.stringify(results, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  // Claim commands
  const claim = program
    .command('claim')
    .description('Manage readiness claims');

  claim
    .command('add')
    .description('Add or update a claim')
    .requiredOption('--service-id <serviceId>', 'Service ID')
    .requiredOption('--title <title>', 'Claim title')
    .requiredOption('--section <section>', 'Readiness section')
    .option('--id <n>', 'Claim ID (for updates)')
    .option('--status <status>', 'Status (PASS, PARTIAL, FAIL, UNKNOWN)')
    .option('--confidence <n>', 'Confidence score 0-100')
    .option('--reason <reason>', 'Reason for status')
    .option('--evidence <ids...>', 'Evidence IDs to link')
    .action(async (opts) => {
      await ensureDatabase(deps);
      try {
        const result = await deps.claimService.upsertClaim({
          id: opts.id ? parseInt(opts.id) : undefined,
          serviceId: opts.serviceId,
          title: opts.title,
          section: opts.section,
          status: opts.status,
          confidence: opts.confidence ? parseInt(opts.confidence) : undefined,
          reason: opts.reason,
          evidenceIds: opts.evidence?.map((id: string) => parseInt(id)),
        });
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  claim
    .command('get')
    .description('Get a claim by ID (includes linked evidence)')
    .argument('<id>', 'Claim ID')
    .action(async (id: string) => {
      await ensureDatabase(deps);
      try {
        const result = await deps.claimService.getClaim(parseInt(id));
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  program
    .command('claims')
    .description('List claims')
    .option('--service-id <serviceId>', 'Filter by service ID')
    .option('--section <section>', 'Filter by section')
    .option('--status <status>', 'Filter by status')
    .action(async (opts) => {
      await ensureDatabase(deps);
      try {
        const results = await deps.claimService.listClaims({
          serviceId: opts.serviceId,
          section: opts.section,
          status: opts.status,
        });
        console.log(JSON.stringify(results, null, 2));
      } catch (error) {
        handleError(error);
      }
    });

  return program;
}

async function ensureDatabase(deps: CliDeps): Promise<void> {
  const connected = await deps.testConnection();
  if (!connected) {
    console.error(
      'Failed to connect to database. Please ensure PostgreSQL is running.'
    );
    console.error('Run: docker compose up -d');
    process.exit(1);
  }
}

function handleError(error: unknown): void {
  const message =
    error instanceof DomainError
      ? error.message
      : error instanceof Error
        ? error.message
        : String(error);
  console.error('Error:', message);
  process.exit(1);
}
