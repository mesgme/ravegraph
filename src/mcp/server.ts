#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { testConnection } from '../persistence/db.js';
import {
  getControls,
  getWorkItems,
  getReadinessTrends,
  getWorkDashboard,
} from '../persistence/repository.js';

/**
 * Work Dashboard MCP Server
 * 
 * Exposes tools for querying the Work Dashboard API:
 * - get_resilience_backlog: Query controls from Control Recommendation Engine (Issue #23)
 * - get_incident_work: Query work items from GitHub Issue Creation Agent (Issue #24)
 * - get_readiness_trends: Query readiness trends from Readiness Scoring Engine (Issue #9)
 * - get_work_dashboard: Get aggregated work dashboard view
 */

const server = new Server(
  {
    name: 'ravegraph-work-dashboard',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: 'get_resilience_backlog',
    description: 'Get resilience backlog controls from the Control Recommendation Engine. Returns controls with Prevent/Detect/Respond/Learn categorization.',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'Optional: Filter by service ID',
        },
        status: {
          type: 'string',
          enum: ['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'],
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
    description: 'Get incident-derived work items from the GitHub Issue Creation Agent. Returns tickets and remediation work.',
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
    description: 'Get readiness trends from the Readiness Scoring Engine. Returns current scores, historical data, and trend direction.',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'Optional: Filter by service ID',
        },
        daysBack: {
          type: 'number',
          description: 'Optional: Number of days of historical data (default: 30)',
        },
      },
    },
  },
  {
    name: 'get_work_dashboard',
    description: 'Get aggregated work dashboard with all components: resilience backlog, incident work, readiness trends, and summary statistics.',
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

// Handle list_tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle call_tool request
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_resilience_backlog': {
        const controls = await getControls(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(controls, null, 2),
            },
          ],
        };
      }

      case 'get_incident_work': {
        const workItems = await getWorkItems(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(workItems, null, 2),
            },
          ],
        };
      }

      case 'get_readiness_trends': {
        const trends = await getReadinessTrends(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(trends, null, 2),
            },
          ],
        };
      }

      case 'get_work_dashboard': {
        const dashboard = await getWorkDashboard(args as any);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(dashboard, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  // Test database connection
  const connected = await testConnection();
  if (!connected) {
    console.error('Failed to connect to database. Please ensure PostgreSQL is running.');
    process.exit(1);
  }

  console.error('Work Dashboard MCP Server starting...');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('Work Dashboard MCP Server running');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
