#!/usr/bin/env node

import { Command } from 'commander';
import { testConnection } from '../persistence/db.js';
import {
  getControls,
  getWorkItems,
  getReadinessTrends,
  getWorkDashboard,
} from '../persistence/repository.js';

/**
 * Ravegraph CLI
 *
 * CLI for interacting with the Work Dashboard using Commander.js framework
 */

const program = new Command();

program
  .name('ravegraph')
  .description('Ravegraph CLI - Work Dashboard for SRE consulting')
  .version('0.1.0');

// Dashboard command
program
  .command('dashboard')
  .alias('d')
  .description('Get full work dashboard (optionally filtered by service)')
  .argument('[serviceId]', 'Service ID to filter by')
  .action(async (serviceId?: string) => {
    await ensureDatabase();
    try {
      const dashboard = await getWorkDashboard(
        serviceId ? { serviceId } : undefined
      );
      console.log(JSON.stringify(dashboard, null, 2));
    } catch (error) {
      handleError(error);
    }
  });

// Controls command
program
  .command('controls')
  .alias('c')
  .description('Get resilience backlog controls')
  .action(async () => {
    await ensureDatabase();
    try {
      const controls = await getControls();
      console.log(JSON.stringify(controls, null, 2));
    } catch (error) {
      handleError(error);
    }
  });

// Work items command
program
  .command('work')
  .alias('w')
  .description('Get incident-derived work items')
  .action(async () => {
    await ensureDatabase();
    try {
      const workItems = await getWorkItems();
      console.log(JSON.stringify(workItems, null, 2));
    } catch (error) {
      handleError(error);
    }
  });

// Readiness trends command
program
  .command('trends')
  .alias('t')
  .description('Get readiness trends')
  .action(async () => {
    await ensureDatabase();
    try {
      const trends = await getReadinessTrends();
      console.log(JSON.stringify(trends, null, 2));
    } catch (error) {
      handleError(error);
    }
  });

/**
 * Ensure database connection is available
 */
async function ensureDatabase(): Promise<void> {
  const connected = await testConnection();
  if (!connected) {
    console.error(
      'Failed to connect to database. Please ensure PostgreSQL is running.'
    );
    console.error('Run: docker compose up -d');
    process.exit(1);
  }
}

/**
 * Handle errors consistently
 */
function handleError(error: unknown): void {
  console.error(
    'Error:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
}

// Parse command line arguments
program.parse();
