import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import type { ControlService } from '../service/control-service.js';
import type { WorkItemService } from '../service/work-item-service.js';
import type { ReadinessService } from '../service/readiness-service.js';
import type { WorkDashboardService } from '../service/work-dashboard-service.js';
import {
  resilienceBacklogSchema,
  incidentWorkSchema,
  readinessTrendsSchema,
  workDashboardSchema,
} from './schemas.js';
import { DomainError } from '../domain/errors.js';

export interface McpServerDeps {
  controlService: ControlService;
  workItemService: WorkItemService;
  readinessService: ReadinessService;
  dashboardService: WorkDashboardService;
}

export function createMcpServer(deps: McpServerDeps): Server {
  const server = new Server(
    { name: 'ravegraph-work-dashboard', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );

  const tools: Tool[] = [
    {
      name: 'get_resilience_backlog',
      description:
        'Get resilience backlog controls from the Control Recommendation Engine. Returns controls with Prevent/Detect/Respond/Learn categorization.',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            description: 'Optional: Filter by service ID',
          },
          status: {
            type: 'string',
            enum: [
              'PROPOSED',
              'APPROVED',
              'IN_PROGRESS',
              'COMPLETED',
              'REJECTED',
            ],
            description: 'Optional: Filter by control status',
          },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            description: 'Optional: Filter by priority',
          },
        },
      },
    },
    {
      name: 'get_incident_work',
      description:
        'Get incident-derived work items from the GitHub Issue Creation Agent. Returns tickets and remediation work.',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            description: 'Optional: Filter by service ID',
          },
          status: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'],
            description: 'Optional: Filter by work item status',
          },
          controlId: {
            type: 'number',
            description: 'Optional: Filter by associated control ID',
          },
        },
      },
    },
    {
      name: 'get_readiness_trends',
      description:
        'Get readiness trends from the Readiness Scoring Engine. Returns current scores, historical data, and trend direction.',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            description: 'Optional: Filter by service ID',
          },
          daysBack: {
            type: 'number',
            description:
              'Optional: Number of days of historical data (default: 30)',
          },
        },
      },
    },
    {
      name: 'get_work_dashboard',
      description:
        'Get aggregated work dashboard with all components: resilience backlog, incident work, readiness trends, and summary statistics.',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: {
            type: 'string',
            description: 'Optional: Filter all data by service ID',
          },
        },
      },
    },
  ];

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case 'get_resilience_backlog': {
          const parsed = resilienceBacklogSchema.parse(args);
          const controls = await deps.controlService.getControls(parsed);
          return {
            content: [
              { type: 'text', text: JSON.stringify(controls, null, 2) },
            ],
          };
        }

        case 'get_incident_work': {
          const parsed = incidentWorkSchema.parse(args);
          const workItems = await deps.workItemService.getWorkItems(parsed);
          return {
            content: [
              { type: 'text', text: JSON.stringify(workItems, null, 2) },
            ],
          };
        }

        case 'get_readiness_trends': {
          const parsed = readinessTrendsSchema.parse(args);
          const trends = await deps.readinessService.getTrends(parsed);
          return {
            content: [{ type: 'text', text: JSON.stringify(trends, null, 2) }],
          };
        }

        case 'get_work_dashboard': {
          const parsed = workDashboardSchema.parse(args);
          const dashboard = await deps.dashboardService.getDashboard(parsed);
          return {
            content: [
              { type: 'text', text: JSON.stringify(dashboard, null, 2) },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage =
        error instanceof DomainError
          ? error.message
          : error instanceof Error
            ? error.message
            : String(error);
      return {
        content: [{ type: 'text', text: `Error: ${errorMessage}` }],
        isError: true,
      };
    }
  });

  return server;
}
