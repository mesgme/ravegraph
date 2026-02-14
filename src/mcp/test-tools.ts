#!/usr/bin/env node

/**
 * Test script for MCP server
 * 
 * This script demonstrates how to call the MCP server tools programmatically.
 * In production, these tools would be called by an MCP client (like Claude).
 */

import {
  getControls,
  getWorkItems,
  getReadinessTrends,
  getWorkDashboard,
} from '../persistence/repository.js';
import { testConnection } from '../persistence/db.js';

async function testMcpTools() {
  console.log('Testing MCP Work Dashboard Tools\n');

  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database');
    process.exit(1);
  }
  console.log('✓ Database connection successful\n');

  // Test 1: get_resilience_backlog
  console.log('Test 1: get_resilience_backlog');
  console.log('  Filters: status=APPROVED, priority=HIGH');
  const controls = await getControls({ status: 'APPROVED', priority: 'HIGH' });
  console.log(`  Result: Found ${controls.length} controls`);
  if (controls.length > 0) {
    console.log(`  Example: ${controls[0].title}`);
  }
  console.log();

  // Test 2: get_incident_work
  console.log('Test 2: get_incident_work');
  console.log('  Filters: status=OPEN');
  const workItems = await getWorkItems({ status: 'OPEN' });
  console.log(`  Result: Found ${workItems.length} work items`);
  if (workItems.length > 0) {
    console.log(`  Example: ${workItems[0].title}`);
  }
  console.log();

  // Test 3: get_readiness_trends
  console.log('Test 3: get_readiness_trends');
  console.log('  Filters: serviceId=api-service, daysBack=30');
  const trends = await getReadinessTrends({ serviceId: 'api-service', daysBack: 30 });
  console.log(`  Result: Found trends for ${trends.length} services`);
  if (trends.length > 0) {
    console.log(`  Example: ${trends[0].serviceName} - ${trends[0].currentScore}% (${trends[0].trend})`);
  }
  console.log();

  // Test 4: get_work_dashboard
  console.log('Test 4: get_work_dashboard');
  console.log('  Filters: serviceId=worker-service');
  const dashboard = await getWorkDashboard({ serviceId: 'worker-service' });
  console.log(`  Result: Dashboard with ${dashboard.resilienceBacklog.controls.length} controls, ${dashboard.incidentWork.workItems.length} work items, ${dashboard.readinessTrends.length} trends`);
  console.log(`  Summary: ${dashboard.summary.totalControls} total controls, ${dashboard.summary.totalWorkItems} total work items`);
  console.log(`  Average readiness: ${dashboard.summary.avgReadinessScore.toFixed(2)}%`);
  console.log();

  // Test 5: Full dashboard (no filters)
  console.log('Test 5: get_work_dashboard (no filters)');
  const fullDashboard = await getWorkDashboard();
  console.log(`  Result: Full dashboard`);
  console.log(`  Controls: ${fullDashboard.resilienceBacklog.controls.length}`);
  console.log(`    - PREVENT: ${fullDashboard.resilienceBacklog.countByType.PREVENT || 0}`);
  console.log(`    - DETECT: ${fullDashboard.resilienceBacklog.countByType.DETECT || 0}`);
  console.log(`    - RESPOND: ${fullDashboard.resilienceBacklog.countByType.RESPOND || 0}`);
  console.log(`    - LEARN: ${fullDashboard.resilienceBacklog.countByType.LEARN || 0}`);
  console.log(`  Work Items: ${fullDashboard.incidentWork.workItems.length}`);
  console.log(`    - OPEN: ${fullDashboard.incidentWork.countByStatus.OPEN || 0}`);
  console.log(`    - IN_PROGRESS: ${fullDashboard.incidentWork.countByStatus.IN_PROGRESS || 0}`);
  console.log(`    - COMPLETED: ${fullDashboard.incidentWork.countByStatus.COMPLETED || 0}`);
  console.log(`  Readiness Trends: ${fullDashboard.readinessTrends.length} services`);
  console.log();

  console.log('✓ All MCP tool tests passed!');
  process.exit(0);
}

testMcpTools().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
