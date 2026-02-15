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
import type { EvidenceService } from '../service/evidence-service.js';
import type { ClaimService } from '../service/claim-service.js';
import {
  resilienceBacklogSchema,
  incidentWorkSchema,
  readinessTrendsSchema,
  workDashboardSchema,
  upsertEvidenceSchema,
  getEvidenceSchema,
  searchEvidenceSchema,
  upsertClaimSchema,
  getClaimSchema,
  listClaimsSchema,
} from './schemas.js';
import { DomainError } from '../domain/errors.js';

export interface McpServerDeps {
  controlService: ControlService;
  workItemService: WorkItemService;
  readinessService: ReadinessService;
  dashboardService: WorkDashboardService;
  evidenceService: EvidenceService;
  claimService: ClaimService;
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
    {
      name: 'upsert_evidence',
      description:
        'Create or update an evidence item in the Evidence Ledger. Provide id to update an existing item.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Optional: Evidence ID to update' },
          serviceId: { type: 'string', description: 'Service ID' },
          evidenceType: {
            type: 'string',
            enum: ['SBOM', 'VULNERABILITY_SCAN', 'MONITORING', 'TESTING', 'DEPLOYMENT', 'PROVENANCE', 'CONFIGURATION', 'OTHER'],
            description: 'Type of evidence',
          },
          source: { type: 'string', description: 'Source of evidence (e.g. tool name)' },
          body: { type: 'object', description: 'Evidence payload (JSON)' },
          confidence: { type: 'number', description: 'Confidence score 0-100' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Optional: Tags' },
          ttlHours: { type: 'number', description: 'Optional: TTL in hours' },
          collectedAt: { type: 'string', description: 'Optional: Collection timestamp (ISO 8601)' },
        },
        required: ['serviceId', 'evidenceType', 'source', 'body', 'confidence'],
      },
    },
    {
      name: 'get_evidence',
      description: 'Get a specific evidence item by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Evidence item ID' },
        },
        required: ['id'],
      },
    },
    {
      name: 'search_evidence',
      description: 'Search evidence items with optional filters.',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: { type: 'string', description: 'Optional: Filter by service ID' },
          evidenceType: {
            type: 'string',
            enum: ['SBOM', 'VULNERABILITY_SCAN', 'MONITORING', 'TESTING', 'DEPLOYMENT', 'PROVENANCE', 'CONFIGURATION', 'OTHER'],
            description: 'Optional: Filter by evidence type',
          },
          tags: { type: 'array', items: { type: 'string' }, description: 'Optional: Filter by tags (any match)' },
          freshOnly: { type: 'boolean', description: 'Optional: Only return non-expired evidence' },
        },
      },
    },
    {
      name: 'upsert_claim',
      description:
        'Create or update a readiness claim. Provide id to update an existing claim.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Optional: Claim ID to update' },
          serviceId: { type: 'string', description: 'Service ID' },
          title: { type: 'string', description: 'Claim title' },
          section: { type: 'string', description: 'Readiness section (e.g. monitoring, security)' },
          status: {
            type: 'string',
            enum: ['PASS', 'PARTIAL', 'FAIL', 'UNKNOWN'],
            description: 'Optional: Claim status (default: UNKNOWN)',
          },
          confidence: { type: 'number', description: 'Optional: Confidence 0-100 (default: 0)' },
          reason: { type: 'string', description: 'Optional: Reason for status' },
          evidenceIds: { type: 'array', items: { type: 'number' }, description: 'Optional: Evidence IDs to link' },
        },
        required: ['serviceId', 'title', 'section'],
      },
    },
    {
      name: 'get_claim',
      description: 'Get a specific claim by ID, including linked evidence.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'Claim ID' },
        },
        required: ['id'],
      },
    },
    {
      name: 'list_claims',
      description: 'List claims with optional filters.',
      inputSchema: {
        type: 'object',
        properties: {
          serviceId: { type: 'string', description: 'Optional: Filter by service ID' },
          section: { type: 'string', description: 'Optional: Filter by section' },
          status: {
            type: 'string',
            enum: ['PASS', 'PARTIAL', 'FAIL', 'UNKNOWN'],
            description: 'Optional: Filter by status',
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

        case 'upsert_evidence': {
          const parsed = upsertEvidenceSchema.parse(args);
          const evidence = await deps.evidenceService.upsertEvidence({
            ...parsed,
            collectedAt: parsed.collectedAt
              ? new Date(parsed.collectedAt)
              : undefined,
          });
          return {
            content: [
              { type: 'text', text: JSON.stringify(evidence, null, 2) },
            ],
          };
        }

        case 'get_evidence': {
          const parsed = getEvidenceSchema.parse(args);
          const evidence = await deps.evidenceService.getEvidence(parsed.id);
          return {
            content: [
              { type: 'text', text: JSON.stringify(evidence, null, 2) },
            ],
          };
        }

        case 'search_evidence': {
          const parsed = searchEvidenceSchema.parse(args);
          const results = await deps.evidenceService.searchEvidence(parsed);
          return {
            content: [
              { type: 'text', text: JSON.stringify(results, null, 2) },
            ],
          };
        }

        case 'upsert_claim': {
          const parsed = upsertClaimSchema.parse(args);
          const claim = await deps.claimService.upsertClaim(parsed);
          return {
            content: [
              { type: 'text', text: JSON.stringify(claim, null, 2) },
            ],
          };
        }

        case 'get_claim': {
          const parsed = getClaimSchema.parse(args);
          const claim = await deps.claimService.getClaim(parsed.id);
          return {
            content: [
              { type: 'text', text: JSON.stringify(claim, null, 2) },
            ],
          };
        }

        case 'list_claims': {
          const parsed = listClaimsSchema.parse(args);
          const claims = await deps.claimService.listClaims(parsed);
          return {
            content: [
              { type: 'text', text: JSON.stringify(claims, null, 2) },
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
