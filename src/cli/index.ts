#!/usr/bin/env node

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
 * Simple CLI for interacting with the Work Dashboard
 */

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Please ensure PostgreSQL is running.');
    console.error('Run: docker compose up -d');
    process.exit(1);
  }

  try {
    switch (command) {
      case 'dashboard':
      case 'd': {
        const serviceId = args[1];
        const dashboard = await getWorkDashboard(serviceId ? { serviceId } : undefined);
        console.log(JSON.stringify(dashboard, null, 2));
        break;
      }

      case 'controls':
      case 'c': {
        const controls = await getControls();
        console.log(JSON.stringify(controls, null, 2));
        break;
      }

      case 'work':
      case 'w': {
        const workItems = await getWorkItems();
        console.log(JSON.stringify(workItems, null, 2));
        break;
      }

      case 'trends':
      case 't': {
        const trends = await getReadinessTrends();
        console.log(JSON.stringify(trends, null, 2));
        break;
      }

      case 'help':
      case 'h':
      case '--help':
      case undefined: {
        console.log(`
Ravegraph CLI - Work Dashboard

Usage:
  ravegraph <command> [options]

Commands:
  dashboard, d [serviceId]   Get full work dashboard (optionally filtered by service)
  controls, c                Get resilience backlog controls
  work, w                    Get incident-derived work items
  trends, t                  Get readiness trends
  help, h                    Show this help message

Examples:
  ravegraph dashboard
  ravegraph dashboard api-service
  ravegraph controls
  ravegraph work
  ravegraph trends

Database:
  Ensure PostgreSQL is running: docker compose up -d
  Connection: localhost:5432/ravegraph
        `);
        break;
      }

      default: {
        console.error(`Unknown command: ${command}`);
        console.error('Run "ravegraph help" for usage information');
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }

  process.exit(0);
}

main();
