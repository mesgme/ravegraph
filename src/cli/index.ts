#!/usr/bin/env node

import { Command } from 'commander';
import type { ControlService } from '../service/control-service.js';
import type { WorkItemService } from '../service/work-item-service.js';
import type { ReadinessService } from '../service/readiness-service.js';
import type { WorkDashboardService } from '../service/work-dashboard-service.js';
import { DomainError } from '../domain/errors.js';

export interface CliDeps {
  controlService: ControlService;
  workItemService: WorkItemService;
  readinessService: ReadinessService;
  dashboardService: WorkDashboardService;
  testConnection: () => Promise<boolean>;
}

export function createCli(deps: CliDeps): Command {
  const program = new Command();

  program
    .name('ravegraph')
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
