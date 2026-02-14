# GitHub Copilot Instructions for Ravegraph

## About This Project

Ravegraph is an MCP-based platform for storing system details for consulting SREs. It provides readiness scoring, supply chain intelligence, and incident learning capabilities.

## Tech Stack

- **Language**: TypeScript with ES2022 target
- **Runtime**: Node.js 18+ with ESM modules
- **Primary Interface**: MCP (Model Context Protocol) server using `@modelcontextprotocol/sdk`
- **Human Interface**: CLI → TUI (future) → Web UI (future)
- **Database**: PostgreSQL (via Docker Compose for development)
- **Dev Environment**: Node/TypeScript native (no Docker for the application itself)

## Project Structure

```
/src
  /mcp            # MCP server implementation and tool handlers
  /cli            # CLI commands for human interaction
  /domain         # Domain types, entities, and business logic
  /persistence    # Database schema, migrations, and repositories
    /schema       # SQL migration files
/docs
  /adr            # Architecture Decision Records
  DELIVERY_BACKLOG.md  # Full backlog and GitHub issues
/questions        # Git-backed YAML question models (future)
```

## Development Workflow

### Starting Development

```bash
# Start PostgreSQL database
docker compose up -d

# Install dependencies
npm install

# Run MCP server
npm run dev

# Run CLI
npm run cli -- --help
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
```

## Coding Conventions

### TypeScript Style

- Use **strict mode** - all TypeScript strict checks are enabled
- Use **ESM imports** (`.js` extensions in imports from compiled files)
- Use **interface** for data structures, **type** for unions and simple aliases
- Use **optional chaining** (`?.`) and **nullish coalescing** (`??`) where appropriate
- Add **JSDoc comments** for exported functions and complex logic
- Use **async/await** for asynchronous code (no raw promises)

### Domain-Driven Design

- Keep domain logic in `/domain` - pure TypeScript, no dependencies on infrastructure
- Keep persistence logic in `/persistence` - SQL and database access
- MCP tools and CLI are thin wrappers over domain/persistence
- Use clear, descriptive names that match the domain language

### TypeScript Patterns

```typescript
// Prefer interfaces for domain entities
export interface Control {
  id: number;
  controlType: ControlType;
  title: string;
  description?: string;
  // ...
}

// Use string literal unions for enums
export type ControlType = 'PREVENT' | 'DETECT' | 'RESPOND' | 'LEARN';
export type ControlStatus = 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';

// Use Record<> for typed objects
countByType: Record<ControlType, number>;
sectionScores?: Record<string, number>;
```

### MCP Server Patterns

- One tool per main operation (query, upsert, search)
- Use descriptive tool names: `get_resilience_backlog`, `get_incident_work`
- Provide clear descriptions and input schemas
- Keep tool handlers focused - delegate to repository layer
- Always validate inputs and provide helpful error messages

### Database Patterns

- SQL schema files in `/src/persistence/schema/` with numeric prefixes (`01-init.sql`)
- Repository pattern - one function per query type
- Use parameterized queries (never string concatenation)
- Keep raw SQL in repository layer, not in domain or MCP handlers
- Return domain types from repositories, not raw database rows

## Key Domain Concepts

### Work Dashboard Components

1. **Resilience Backlog** - Controls from Control Recommendation Engine (Issue #23)
   - Prevent/Detect/Respond/Learn categorization
   - Priority and status tracking

2. **Incident-Derived Work** - Work items from GitHub Issue Creation Agent (Issue #24)
   - Remediation tickets, investigation tasks, documentation work
   - Links to external systems (GitHub, JIRA, Linear)

3. **Readiness Trends** - Scoring data from Readiness Scoring Engine (Issue #9)
   - Service readiness scores over time
   - Trend analysis (improving/declining/stable)

## Git Workflow

- **Never merge PRs** - create PRs and leave merging to the user
- Use `--author="Claude Code <claude-code@anthropic.com>"` for all commits
- **Always use worktrees** for feature branches (never switch branches in main worktree)
- No direct push to main (branch protection enforced)

### Worktree Workflow

```bash
# Start a new feature (from main worktree)
git worktree add ../ravegraph-<feature> -b feature/<feature-name>

# Work in the new worktree
cd ../ravegraph-<feature>

# When done, create PR, then clean up after merge
git worktree remove ../ravegraph-<feature>
git branch -d feature/<feature-name>
git push origin --delete feature/<feature-name>
```

## Testing

- Tests are not yet implemented (see `package.json`: `"test": "echo \"No tests yet\" && exit 0"`)
- When adding tests, follow these patterns:
  - Unit tests for domain logic
  - Integration tests for repository/database
  - Tool tests for MCP server handlers
  - Use a test database for integration tests

## Common Tasks

### Adding a New MCP Tool

1. Define the tool in `tools` array in `/src/mcp/server.ts`
2. Add tool handler in the switch statement
3. Implement repository function in `/src/persistence/repository.ts`
4. Add domain types if needed in `/src/domain/types.ts`
5. Update SQL schema if database changes are needed

### Adding a New CLI Command

1. Add command handler in `/src/cli/index.ts`
2. Use existing repository functions or add new ones
3. Format output for human readability (tables, colors)

### Adding a Database Table

1. Create a new migration file in `/src/persistence/schema/`
2. Add domain types in `/src/domain/types.ts`
3. Add repository functions in `/src/persistence/repository.ts`
4. Update existing aggregations if needed

## Dependencies

- **@modelcontextprotocol/sdk** - MCP server implementation
- **pg** - PostgreSQL client
- **tsx** - TypeScript execution for development
- **typescript** - TypeScript compiler

Keep dependencies minimal. Only add new dependencies when absolutely necessary.

## Documentation

- See `docs/adr/` for Architecture Decision Records
- See `docs/DELIVERY_BACKLOG.md` for the full backlog and GitHub issues
- See `docs/API.md` for API documentation
- Update relevant docs when making significant changes

## Best Practices

1. **Prefer composition over inheritance** - use functions and interfaces
2. **Keep functions small and focused** - single responsibility principle
3. **Use TypeScript's type system** - avoid `any`, use proper types
4. **Error handling** - use try-catch for async operations, provide context
5. **Logging** - use console.error for errors, console.log for info (no logger library yet)
6. **SQL** - keep SQL readable with proper formatting and comments
7. **Async** - always await async calls, handle errors properly
8. **Naming** - use clear, descriptive names that match domain terminology

## What to Avoid

- ❌ Don't add comments for obvious code
- ❌ Don't use classes unless there's a compelling reason
- ❌ Don't mix concerns (domain, persistence, presentation)
- ❌ Don't commit secrets, API keys, or sensitive data
- ❌ Don't add unnecessary dependencies
- ❌ Don't use `any` type - use proper types or `unknown`
- ❌ Don't merge PRs yourself - leave that to the user
- ❌ Don't switch branches in the main worktree - use git worktrees

## Questions?

Refer to:
- `README.md` for setup and usage
- `CLAUDE.md` for development guidelines
- `IMPLEMENTATION.md` for detailed feature documentation
- `docs/DELIVERY_BACKLOG.md` for roadmap and issues
