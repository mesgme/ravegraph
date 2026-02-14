# Ravegraph

An MCP-based platform for storing system details for consulting SREs. Readiness scoring, supply chain intelligence, and incident learning.

## Tech Stack

- **Language**: TypeScript
- **Primary interface**: MCP server (`@modelcontextprotocol/sdk`)
- **Human interface**: CLI → TUI → Web UI
- **Database**: PostgreSQL (Docker Compose for dev)
- **Dev environment**: Node/TypeScript native (no Docker for the app)

## Features

### Work Dashboard API (Issue #25)

The Work Dashboard exposes three main components:

1. **Resilience Backlog** - Controls from the Control Recommendation Engine (Issue #23)
   - Prevent/Detect/Respond/Learn categorization
   - Priority and status tracking
   
2. **Incident-Derived Work** - Work items from GitHub Issue Creation Agent (Issue #24)
   - Remediation tickets
   - Investigation tasks
   - Documentation work

3. **Readiness Trends** - Scoring data from Readiness Scoring Engine (Issue #9)
   - Service readiness scores over time
   - Trend analysis (improving/declining/stable)
   - Section-level scoring

## Setup

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL client (optional, for manual DB access)

### Installation

```bash
# Install dependencies
npm install

# Start PostgreSQL database
docker compose up -d

# Wait for database to initialize (first time only)
sleep 5
```

The database schema will be automatically created on first start.

### Verify Installation

```bash
# Build the project
npm run build

# Link CLI globally (optional)
npm link

# Test CLI directly
rave --help

# Or test via npm script
npm run cli -- help

# Test MCP server (in another terminal)
npm run dev
```

## Usage

### CLI

The CLI provides quick access to Work Dashboard data using the Commander.js framework.

#### Using the Global Command (after `npm link`)

```bash
# Show help
rave --help

# Get full work dashboard
rave dashboard

# Get dashboard for specific service
rave dashboard api-service

# Get resilience backlog controls
rave controls

# Get incident-derived work items
rave work

# Get readiness trends
rave trends

# Use command aliases (d, c, w, t)
rave d          # dashboard
rave c          # controls
rave w          # work
rave t          # trends
```

#### Using npm run cli

```bash
# Get full work dashboard
npm run cli -- dashboard

# Get dashboard for specific service
npm run cli -- dashboard api-service

# Get resilience backlog controls
npm run cli -- controls

# Get incident-derived work items
npm run cli -- work

# Get readiness trends
npm run cli -- trends

# Show help
npm run cli -- help
```

### MCP Server

The MCP server exposes tools for AI agents:

```bash
# Start the MCP server
npm run dev
```

#### Available MCP Tools

1. **get_resilience_backlog**
   - Get controls from Control Recommendation Engine
   - Supports filtering by service, status, priority
   
2. **get_incident_work**
   - Get work items from GitHub Issue Creation Agent
   - Supports filtering by service, status, control ID
   
3. **get_readiness_trends**
   - Get readiness trends from Readiness Scoring Engine
   - Supports filtering by service and time range
   
4. **get_work_dashboard**
   - Get aggregated dashboard with all components
   - Includes summary statistics

#### MCP Tool Examples

```json
// Get resilience backlog
{
  "name": "get_resilience_backlog",
  "arguments": {
    "status": "PROPOSED",
    "priority": "HIGH"
  }
}

// Get incident work
{
  "name": "get_incident_work",
  "arguments": {
    "serviceId": "api-service",
    "status": "OPEN"
  }
}

// Get readiness trends
{
  "name": "get_readiness_trends",
  "arguments": {
    "serviceId": "api-service",
    "daysBack": 30
  }
}

// Get full dashboard
{
  "name": "get_work_dashboard",
  "arguments": {
    "serviceId": "api-service"
  }
}
```

## Database Schema

The Work Dashboard uses the following main tables:

- **readiness_scores** - Readiness scoring data over time
- **controls** - Resilience controls (Prevent/Detect/Respond/Learn)
- **work_items** - Incident-derived work and remediation tickets
- **incidents** - Incident records
- **services** - Service metadata

See `src/persistence/schema/01-init.sql` for full schema details.

## Development

### Project Structure

```
/src
  /cli            # CLI commands
  /mcp            # MCP server implementation
  /domain         # Domain types and models
  /persistence    # Database schema and repositories
    /schema       # SQL migrations
```

### Building

```bash
# Compile TypeScript
npm run build

# Run compiled server
node dist/mcp/server.js
```

### Database Access

```bash
# Connect to PostgreSQL
docker exec -it ravegraph-db psql -U ravegraph -d ravegraph

# View tables
\dt

# Query data
SELECT * FROM controls;
SELECT * FROM work_items;
SELECT * FROM readiness_scores;
```

## Architecture Decision Records

See `docs/adr/` for Architecture Decision Records.

## Delivery Backlog

See `docs/DELIVERY_BACKLOG.md` for the full backlog and GitHub issues.

## Dependencies

This issue (Work Dashboard API - #25) depends on:
- Issue #9 - Readiness Scoring Engine
- Issue #23 - Control Recommendation Engine  
- Issue #24 - GitHub Issue Creation Agent

The current implementation provides the API structure and can be populated with real data once the dependency issues are completed.

## License

MIT
