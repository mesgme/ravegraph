import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from './config/index.js';
import { createLogger } from './logging/index.js';
import { createDb, testConnection } from './persistence/connection.js';
import { PgControlRepository } from './persistence/repositories/pg-control-repository.js';
import { PgWorkItemRepository } from './persistence/repositories/pg-work-item-repository.js';
import { PgReadinessRepository } from './persistence/repositories/pg-readiness-repository.js';
import { PgEvidenceRepository } from './persistence/repositories/pg-evidence-repository.js';
import { PgClaimRepository } from './persistence/repositories/pg-claim-repository.js';
import { ControlService } from './service/control-service.js';
import { WorkItemService } from './service/work-item-service.js';
import { ReadinessService } from './service/readiness-service.js';
import { WorkDashboardService } from './service/work-dashboard-service.js';
import { EvidenceService } from './service/evidence-service.js';
import { ClaimService } from './service/claim-service.js';
import { createMcpServer } from './mcp/server.js';
import { createCli } from './cli/index.js';
import { ShutdownManager } from './shutdown.js';

export async function buildApp() {
  const config = loadConfig();
  const logger = createLogger(config);
  const db = createDb(config);
  const shutdown = new ShutdownManager();

  shutdown.register('database', async () => {
    await db.destroy();
    logger.info('Database connection closed');
  });
  shutdown.installSignalHandlers();

  // Repositories
  const controlRepo = new PgControlRepository(db);
  const workItemRepo = new PgWorkItemRepository(db);
  const readinessRepo = new PgReadinessRepository(db);
  const evidenceRepo = new PgEvidenceRepository(db);
  const claimRepo = new PgClaimRepository(db);

  // Services
  const controlService = new ControlService(controlRepo);
  const workItemService = new WorkItemService(workItemRepo);
  const readinessService = new ReadinessService(readinessRepo);
  const dashboardService = new WorkDashboardService(
    controlRepo,
    workItemRepo,
    readinessRepo
  );
  const evidenceService = new EvidenceService(evidenceRepo);
  const claimService = new ClaimService(claimRepo);

  const deps = {
    controlService,
    workItemService,
    readinessService,
    dashboardService,
    evidenceService,
    claimService,
  };

  return {
    config,
    logger,
    db,
    shutdown,
    ...deps,
    testConnection: () => testConnection(db),

    async startMcpServer() {
      const connected = await testConnection(db);
      if (!connected) {
        logger.error(
          'Failed to connect to database. Please ensure PostgreSQL is running.'
        );
        process.exit(1);
      }

      logger.info('Work Dashboard MCP Server starting...');
      const server = createMcpServer(deps);
      const transport = new StdioServerTransport();
      await server.connect(transport);
      logger.info('Work Dashboard MCP Server running');
    },

    async startCli() {
      const cli = createCli({
        ...deps,
        testConnection: () => testConnection(db),
      });
      await cli.parseAsync();
    },
  };
}
