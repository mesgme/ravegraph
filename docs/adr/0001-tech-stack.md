# ADR-0001: Technology Stack

## Status
Accepted

## Date
2026-02-13

## Context
Ravegraph is an MCP-based platform for storing system details for consulting SREs. We needed to choose a language, database, dev environment approach, and human interface strategy.

The original design (from ChatGPT) did not specify a tech stack. Key constraints:
- Must support MCP server (Model Context Protocol) as the primary interface for Claude agents
- Needs a relational database for entities with rich relationships (services, evidence, claims, dependency graphs)
- Human users need to view and edit data directly
- The primary developer is experienced in Python but wants to learn TypeScript

## Options Considered

### Language
- **TypeScript** — Reference MCP SDK, strong ecosystem for CLI/TUI/Web, single language if web UI added later
- **Python** — First-class MCP SDK, developer's existing expertise, Cosmic Python architecture patterns already known

### Database
- **PostgreSQL** — Relational, mature, handles dependency graphs and entity relationships well
- **SQLite** — Simpler but limited for concurrent access and graph queries

### Dev Environment
- **Docker for everything** — Reproducible but adds friction; MCP servers run locally by design
- **Native dev + Docker for DB only** — Fast iteration, Docker only for Postgres

### Human Interface
- **Web UI first** — Rich but heavy upfront investment
- **CLI first → TUI → Web UI** — Incremental, scriptable, TUI gives interactive browsing without a browser

## Decision

| Layer | Choice |
|---|---|
| Language | TypeScript |
| Primary interface | MCP server (`@modelcontextprotocol/sdk`) |
| Human interface | CLI first, then TUI, then Web UI |
| Database | PostgreSQL |
| DB for dev | Docker Compose (Postgres only) |
| Dev environment | Node/TypeScript native (no Docker for the app) |

## Rationale

- **TypeScript over Python**: Both have first-class MCP SDKs. TypeScript chosen as a learning opportunity and for potential single-language advantage if a web UI is added later. Python was the stronger option based on existing experience but the developer preferred to learn TypeScript.
- **PostgreSQL**: The domain is inherently relational — services link to evidence, evidence supports claims, claims reference questions, incidents link to releases and artifacts. A relational DB is the natural fit.
- **No Docker dev environment**: MCP servers are started locally by the Claude client, so containerising the dev experience fights against how the server is actually used. Docker Compose for Postgres only keeps the database reproducible without slowing iteration.
- **CLI first**: Scriptable, testable, fast to build. TUI adds interactive browsing later. Web UI is a future concern.

## Consequences
- Developer will be learning TypeScript while building — expect slower early velocity
- ORM/query layer, package manager, TUI framework, and testing framework still to be decided (separate ADRs)
- Architecture should follow clean separation (domain layer shared across MCP server, CLI, and future TUI/Web) to avoid logic duplication
