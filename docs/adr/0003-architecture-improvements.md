# ADR-0003: Architecture Improvements

## Status

Accepted

## Date

2026-02-14

## Context

The initial codebase (~500 lines, 6 files) used a flat architecture: MCP/CLI handlers called directly into a monolithic repository module backed by a global database pool. This worked for the initial prototype but had several issues:

- **No dependency injection** — MCP server and CLI directly imported the repository, making testing impossible without a database
- **`any` types throughout** — Database row mappings used `any`, losing type safety
- **No error hierarchy** — All errors were generic `Error` instances
- **No validation** — MCP tool inputs were cast with `as any`
- **No configuration management** — Database config was scattered across env var reads
- **Magic numbers** — Trend thresholds and defaults were inline
- **No tests** — Zero test coverage

## Decision

### Technology Choices

| Component | Choice | Rationale |
|---|---|---|
| **Query builder** | Kysely | Type-safe SQL without ORM opinions. `Database` interface eliminates `any` in mappers. |
| **Validation** | Zod | Schemas produce TypeScript types. Replaces `args as any` in MCP handlers. |
| **Logging** | Pino | Fastest Node.js structured logger. `pino-pretty` for dev. |
| **Testing** | Vitest | Native TypeScript/ESM support, Jest-compatible API. |

### Architecture Pattern

Adopted a ports-and-adapters (hexagonal) architecture:

```
src/
  domain/          # Types, errors, constants, port interfaces
    ports/         # Repository interfaces (ControlRepository, etc.)
  service/         # Business logic (ReadinessService, WorkDashboardService, etc.)
  persistence/     # Kysely repository implementations
    repositories/  # PgControlRepository, PgWorkItemRepository, etc.
    migrations/    # Kysely migrations
  mcp/             # MCP server adapter (factory function + Zod schemas)
  cli/             # CLI adapter (factory function)
  config/          # Centralized Zod-validated configuration
  logging/         # Pino logger factory
  app.ts           # Composition root
  shutdown.ts      # Graceful shutdown manager
```

### Key Principles

1. **Dependency inversion** — Domain defines port interfaces, persistence implements them
2. **Composition root** — All wiring happens in `app.ts`, no global singletons
3. **Validated boundaries** — Zod schemas at MCP/CLI entry points
4. **Type-safe persistence** — Kysely `Database` interface with row types eliminates `any`
5. **TDD** — All new code written test-first

## Consequences

### Positive

- Services can be tested with mock repositories (no database needed)
- `no-explicit-any` is now an ESLint error — type safety enforced at CI
- Adding new MCP tools follows a clear pattern: schema → service → repository
- Database connection is injectable, not a global singleton
- Graceful shutdown properly cleans up resources

### Negative

- More files and indirection than the flat approach
- Learning curve for Kysely's query builder syntax
- Slightly more boilerplate for thin service wrappers

### Neutral

- Existing SQL schema files retained for Docker Compose init
- Kysely migration mirrors the SQL schema (dual maintenance until Docker init is updated)
