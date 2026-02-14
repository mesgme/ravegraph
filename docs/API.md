# Work Dashboard API Documentation

## Overview

The Work Dashboard API provides a comprehensive view of resilience work across three key dimensions:

1. **Resilience Backlog** - Controls from the Control Recommendation Engine (Issue #23)
2. **Incident-Derived Work** - Work items from the GitHub Issue Creation Agent (Issue #24)
3. **Readiness Trends** - Scoring trends from the Readiness Scoring Engine (Issue #9)

## Access Methods

The Work Dashboard can be accessed through two interfaces:

### 1. MCP Server (Primary Interface)

The MCP server exposes tools that can be called by AI agents (like Claude):

```bash
npm run dev
```

### 2. CLI (Human Interface)

The CLI provides direct command-line access:

```bash
npm run cli -- <command> [options]
```

## MCP Tools

### get_resilience_backlog

Get controls from the Control Recommendation Engine with Prevent/Detect/Respond/Learn categorization.

**Parameters:**
- `serviceId` (string, optional): Filter by service ID
- `status` (string, optional): Filter by control status
  - Values: `PROPOSED`, `APPROVED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`
- `priority` (string, optional): Filter by priority
  - Values: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

**Response:**
```json
[
  {
    "id": 1,
    "controlType": "PREVENT",
    "title": "Implement connection pool monitoring",
    "description": "Add alerts for connection pool saturation before exhaustion",
    "incidentId": 1,
    "serviceId": "api-service",
    "priority": "HIGH",
    "status": "APPROVED",
    "createdAt": "2026-02-14T06:27:07.915Z",
    "updatedAt": "2026-02-14T06:27:07.915Z"
  }
]
```

**Control Types:**
- `PREVENT`: Preventive controls to avoid incidents
- `DETECT`: Detection mechanisms for early warning
- `RESPOND`: Response procedures for active incidents
- `LEARN`: Learning and improvement activities

**Use Cases:**
- Query all proposed controls: `{ "status": "PROPOSED" }`
- Get high-priority controls: `{ "priority": "HIGH" }`
- Filter by service: `{ "serviceId": "api-service" }`

---

### get_incident_work

Get incident-derived work items from the GitHub Issue Creation Agent.

**Parameters:**
- `serviceId` (string, optional): Filter by service ID
- `status` (string, optional): Filter by work item status
  - Values: `OPEN`, `IN_PROGRESS`, `COMPLETED`, `CLOSED`
- `controlId` (number, optional): Filter by associated control ID

**Response:**
```json
[
  {
    "id": 1,
    "externalId": "GH-101",
    "externalSystem": "GITHUB",
    "title": "Add connection pool monitoring alerts",
    "description": "Implement CloudWatch alerts for RDS connection pool metrics",
    "workType": "REMEDIATION",
    "controlId": 1,
    "incidentId": 1,
    "serviceId": "api-service",
    "status": "IN_PROGRESS",
    "assignedTo": "alice",
    "createdAt": "2026-02-14T06:27:07.917Z",
    "updatedAt": "2026-02-14T06:27:07.917Z"
  }
]
```

**Work Types:**
- `REMEDIATION`: Code changes to fix issues
- `INVESTIGATION`: Root cause analysis
- `DOCUMENTATION`: Runbooks and documentation
- `MODEL_UPDATE`: Updates to the readiness model

**External Systems:**
- `GITHUB`: GitHub Issues
- `JIRA`: Jira tickets
- `LINEAR`: Linear issues

**Use Cases:**
- Get open work: `{ "status": "OPEN" }`
- Find work for a service: `{ "serviceId": "api-service" }`
- Get work linked to a control: `{ "controlId": 1 }`

---

### get_readiness_trends

Get readiness trends from the Readiness Scoring Engine with historical data and trend analysis.

**Parameters:**
- `serviceId` (string, optional): Filter by service ID
- `daysBack` (number, optional): Number of days of historical data (default: 30)

**Response:**
```json
[
  {
    "serviceId": "api-service",
    "serviceName": "API Service",
    "currentScore": 85.5,
    "previousScore": 82,
    "trend": "IMPROVING",
    "scores": [
      {
        "serviceId": "api-service",
        "serviceName": "API Service",
        "score": 85.5,
        "sectionScores": {
          "deploy": 90,
          "monitoring": 85,
          "security": 82,
          "documentation": 85
        },
        "recordedAt": "2026-02-14T06:27:07.919Z",
        "createdAt": "2026-02-14T06:27:07.919Z"
      }
    ]
  }
]
```

**Trend Values:**
- `IMPROVING`: Score increased by more than 1 point
- `DECLINING`: Score decreased by more than 1 point
- `STABLE`: Score changed by less than 1 point
- `NEW`: First score recorded (no historical data)

**Section Scores:**
- `deploy`: Deploy safety readiness
- `monitoring`: Observability and alerting
- `security`: Security controls
- `documentation`: Operational documentation

**Use Cases:**
- Get trends for one service: `{ "serviceId": "api-service" }`
- Get recent trends: `{ "daysBack": 7 }`
- Get all service trends: `{}`

---

### get_work_dashboard

Get aggregated work dashboard with all components and summary statistics.

**Parameters:**
- `serviceId` (string, optional): Filter all data by service ID

**Response:**
```json
{
  "resilienceBacklog": {
    "controls": [...],
    "countByType": {
      "PREVENT": 2,
      "DETECT": 2,
      "RESPOND": 1,
      "LEARN": 1
    },
    "countByPriority": {
      "LOW": 0,
      "MEDIUM": 2,
      "HIGH": 3,
      "CRITICAL": 1
    },
    "countByStatus": {
      "PROPOSED": 2,
      "APPROVED": 2,
      "IN_PROGRESS": 1,
      "COMPLETED": 1,
      "REJECTED": 0
    }
  },
  "incidentWork": {
    "workItems": [...],
    "countByStatus": {
      "OPEN": 2,
      "IN_PROGRESS": 2,
      "COMPLETED": 1,
      "CLOSED": 0
    },
    "countByType": {
      "REMEDIATION": 3,
      "INVESTIGATION": 1,
      "DOCUMENTATION": 1,
      "MODEL_UPDATE": 0
    }
  },
  "readinessTrends": [...],
  "summary": {
    "totalControls": 6,
    "totalWorkItems": 5,
    "servicesTracked": 3,
    "avgReadinessScore": 75.17
  }
}
```

**Summary Statistics:**
- `totalControls`: Total number of controls in the backlog
- `totalWorkItems`: Total number of work items
- `servicesTracked`: Number of services with readiness scores
- `avgReadinessScore`: Average readiness score across all services

**Use Cases:**
- Get full dashboard: `{}`
- Get dashboard for one service: `{ "serviceId": "api-service" }`

---

## CLI Commands

### dashboard / d

Get the full work dashboard with optional service filtering.

```bash
# Full dashboard
npm run cli -- dashboard

# Dashboard for specific service
npm run cli -- dashboard api-service
```

### controls / c

Get resilience backlog controls.

```bash
npm run cli -- controls
```

### work / w

Get incident-derived work items.

```bash
npm run cli -- work
```

### trends / t

Get readiness trends.

```bash
npm run cli -- trends
```

### help / h

Show help information.

```bash
npm run cli -- help
```

---

## Data Model

### Control

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| controlType | ControlType | Type: PREVENT, DETECT, RESPOND, LEARN |
| title | string | Control title |
| description | string? | Detailed description |
| incidentId | number? | Related incident ID |
| serviceId | string? | Related service ID |
| priority | Priority? | Priority: LOW, MEDIUM, HIGH, CRITICAL |
| status | ControlStatus | Status: PROPOSED, APPROVED, IN_PROGRESS, COMPLETED, REJECTED |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update time |

### WorkItem

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| externalId | string? | External system identifier (e.g., GH-101) |
| externalSystem | ExternalSystem? | System: GITHUB, JIRA, LINEAR |
| title | string | Work item title |
| description | string? | Detailed description |
| workType | WorkType? | Type: REMEDIATION, INVESTIGATION, DOCUMENTATION, MODEL_UPDATE |
| controlId | number? | Related control ID |
| incidentId | number? | Related incident ID |
| serviceId | string? | Related service ID |
| status | WorkStatus | Status: OPEN, IN_PROGRESS, COMPLETED, CLOSED |
| assignedTo | string? | Assignee username |
| createdAt | timestamp | Creation time |
| updatedAt | timestamp | Last update time |

### ReadinessScore

| Field | Type | Description |
|-------|------|-------------|
| id | number | Unique identifier |
| serviceId | string | Service identifier |
| serviceName | string | Service display name |
| score | number | Overall readiness score (0-100) |
| sectionScores | object? | Scores by section (deploy, monitoring, security, documentation) |
| recordedAt | timestamp | Score recording time |
| createdAt | timestamp | Creation time |

### ReadinessTrend

| Field | Type | Description |
|-------|------|-------------|
| serviceId | string | Service identifier |
| serviceName | string | Service display name |
| currentScore | number | Latest readiness score |
| previousScore | number? | Previous score for comparison |
| trend | string | Trend direction: IMPROVING, DECLINING, STABLE, NEW |
| scores | ReadinessScore[] | Historical scores (most recent first) |

---

## Integration Examples

### Query Open Work for a Service

```typescript
// MCP Tool Call
{
  "name": "get_incident_work",
  "arguments": {
    "serviceId": "api-service",
    "status": "OPEN"
  }
}
```

```bash
# CLI equivalent (with manual filtering)
npm run cli -- work | jq '.[] | select(.serviceId == "api-service" and .status == "OPEN")'
```

### Track Readiness Improvement

```typescript
// MCP Tool Call
{
  "name": "get_readiness_trends",
  "arguments": {
    "serviceId": "api-service",
    "daysBack": 7
  }
}
```

```bash
# CLI
npm run cli -- trends | jq '.[] | select(.serviceId == "api-service")'
```

### Generate Work Summary

```typescript
// MCP Tool Call
{
  "name": "get_work_dashboard",
  "arguments": {}
}
```

Then extract summary:
```json
{
  "totalControls": 6,
  "totalWorkItems": 5,
  "servicesTracked": 3,
  "avgReadinessScore": 75.17
}
```

---

## Dependencies

This API depends on three upstream systems:

1. **Readiness Scoring Engine (Issue #9)**
   - Provides: Readiness scores and section-level scoring
   - Writes to: `readiness_scores` table

2. **Control Recommendation Engine (Issue #23)**
   - Provides: Resilience controls with PDRL categorization
   - Writes to: `controls` table

3. **GitHub Issue Creation Agent (Issue #24)**
   - Provides: Auto-generated work items from controls
   - Writes to: `work_items` table

The current implementation provides the API structure with sample data. When dependencies are completed, they will write directly to these tables and the API will automatically expose their data.

---

## Testing

### Run All Tests

```bash
# Start database
docker compose up -d

# Wait for initialization
sleep 5

# Load sample data
docker exec -i ravegraph-db psql -U ravegraph -d ravegraph < src/persistence/schema/02-sample-data.sql

# Test MCP tools
npx tsx src/mcp/test-tools.ts

# Test CLI commands
npm run cli -- dashboard
npm run cli -- controls
npm run cli -- work
npm run cli -- trends
```

### Test Filtering

```bash
# Service-specific dashboard
npm run cli -- dashboard api-service

# Filter via database query (example)
docker exec -it ravegraph-db psql -U ravegraph -d ravegraph -c "SELECT * FROM controls WHERE status = 'APPROVED';"
```

---

## Future Enhancements

1. **Pagination**: Add pagination for large result sets
2. **Sorting**: Add sort parameters (by date, priority, score)
3. **Time-based filtering**: Add date range filters for historical queries
4. **Aggregations**: Add more summary statistics and groupings
5. **Real-time updates**: Add webhook support for real-time dashboard updates
6. **Export**: Add CSV/JSON export functionality
7. **Metrics**: Add Prometheus metrics for API usage
