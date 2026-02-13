# MCP Readiness & Resilience Platform — Delivery Backlog

This document defines the delivery plan for building the MCP-based Readiness, Supply Chain, Deploy Safety, and Incident Learning platform.

---

## Technology Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Primary interface | MCP server (tools) | Claude agents interact natively; no wrapper needed |
| Language | TypeScript | Best MCP SDK support, Anthropic reference implementation |
| Database | PostgreSQL | Relational fits the domain (entities, relationships, dependency graphs) |
| DB for dev | Docker Compose (Postgres only) | Reproducible, disposable; no Docker for the app itself |
| Dev environment | Node/TypeScript native | Fast iteration; MCP servers run locally by design |
| Human interface | CLI → TUI → Web UI | CLI first (Phase 1), TUI (Phase 2+), Web UI (later) |
| HTTP API | Later, thin layer | For dashboards/CI/Web UI — not a priority for Phase 1 |

## Repository Structure

```
/src
  /tools          # MCP tool handlers (upsert_evidence, search_evidence, etc.)
  /cli            # CLI commands (ravegraph services list, etc.)
  /tui            # Terminal UI (Phase 2+)
  /domain         # Entities, scoring logic, taxonomy
  /persistence    # DB schema, migrations, repositories
  /ingestion      # SBOM, vuln, provenance pipelines
/questions        # Git-backed YAML question models
/docs
```

## Architecture

```
                  ┌─────────────┐
                  │  Ravegraph  │
                  │   Domain    │
                  └──────┬──────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
      ┌─────┴─────┐ ┌───┴────┐ ┌────┴─────┐
      │ MCP Server │ │  CLI   │ │ TUI/Web  │
      │ (agents)   │ │(human) │ │ (later)  │
      └────────────┘ └────────┘ └──────────┘
```

All interfaces are thin layers over shared domain and persistence logic.

---

# Phase 1 — MCP Evidence Ledger (Foundation)

## Epic: MCP Core Platform

---

### Issue 1 — Initialize MCP Platform Repository

**Description**
Bootstrap the MCP platform mono-repo with core structure and development tooling.

**Deliverables**

* Repo structure (see Technology Decisions above)
* Node/TypeScript toolchain (package.json, tsconfig)
* `docker-compose.yml` with PostgreSQL
* CI pipeline
* Linting + formatting (ESLint, Prettier)
* MCP server scaffold (basic `@modelcontextprotocol/sdk` setup)
* Architecture README

**Acceptance Criteria**

* Repo builds and MCP server starts locally
* `docker compose up` starts Postgres
* CI passes on PR
* Base README explains architecture

**Dependencies**
None

**Labels**
`platform-foundation` `repo-bootstrap`

---

### Issue 1b — CLI Scaffold

**Description**
Set up the `ravegraph` CLI framework alongside the MCP server.

**Deliverables**

* CLI entry point (`ravegraph` command)
* Command framework (e.g. Commander.js or similar)
* Shared domain/persistence wiring with MCP server
* `ravegraph --help` works

**Acceptance Criteria**

* `ravegraph` command runs locally
* Help output lists available subcommands
* Shares domain layer with MCP server (no logic duplication)

**Dependencies**
Issue 1

**Labels**
`cli` `platform-foundation`

---

### Issue 2 — Core Schema Design

**Description**
Implement foundational persistence schema.

**Entities**

* Service
* EvidenceItem
* Claim

**Deliverables**

* DB schema + migrations
* ORM/data models
* Validation layer

**Acceptance Criteria**

* Entities CRUD-able via MCP tools
* Evidence linked to services
* Claims reference evidence

**Dependencies**
Issue 1

**Labels**
`schema` `evidence`

---

### Issue 3 — Evidence Ingestion

**Description**
Build ingestion + retrieval interfaces via MCP tools and CLI.

**MCP Tools**

* `upsert_evidence`
* `search_evidence`
* `get_evidence`

**CLI Commands**

* `ravegraph evidence add`
* `ravegraph evidence search`
* `ravegraph evidence get`

**Capabilities**

* Tagging
* Confidence scoring
* Freshness TTL
* Source provenance

**Acceptance Criteria**

* Evidence searchable by service + type
* Freshness metadata stored
* Confidence stored

**Dependencies**
Issue 2

**Labels**
`api` `evidence`

---

### Issue 4 — Service Registry

**Description**
Store and manage service metadata via MCP tools and CLI.

**MCP Tools**

* `list_services`
* `get_service`
* `upsert_service`

**CLI Commands**

* `ravegraph services list`
* `ravegraph services get <id>`
* `ravegraph services add`

**Metadata**

* Repo links
* Tier
* Owners
* Dependencies

**Acceptance Criteria**

* Services queryable
* Dependency graph storable

**Dependencies**
Issue 2

**Labels**
`service-catalog`

---

### Issue 5 — Claim Computation Engine

**Description**
Compute readiness claims from evidence.

**Logic**

* PASS / PARTIAL / FAIL / UNKNOWN
* Freshness weighting
* Evidence citation linking

**Acceptance Criteria**

* Claims auto-computable
* Evidence traceable
* Confidence scoring applied

**Dependencies**
Issues 2–3

**Labels**
`scoring` `claims`

---

# Phase 2 — Readiness Question Engine

## Epic: Readiness Model & Scoring

---

### Issue 6 — Question Schema & Storage

**Entities**

* Question
* Section
* Applicability Rules

**Fields**

* Severity
* TTL
* Expected evidence

**Acceptance Criteria**

* Questions CRUD-able
* Applicability rules evaluable

**Dependencies**
Issue 2

**Labels**
`question-model`

---

### Issue 7 — Git-Backed Question Model Loader

**Description**
Load readiness questions from Git YAML.

**Repo Structure**

```
/questions/deploy_safely/
/questions/supply_chain/
```

**Capabilities**

* YAML validation
* DB sync
* Version tracking

**Acceptance Criteria**

* Git changes reflected in MCP
* Schema validation enforced

**Dependencies**
Issue 6

**Labels**
`governance` `question-model`

---

### Issue 8 — Readiness Scoring Engine

**Description**
Compute service readiness scores.

**Capabilities**

* Weighted scoring
* Severity multipliers
* Freshness penalties

**Acceptance Criteria**

* Service readiness % calculable
* Section scoring supported

**Dependencies**
Issues 5–7

**Labels**
`scoring`

---

### Issue 9 — Evidence Gap Detection Engine

**Description**
Identify missing or stale readiness evidence.

**Outputs**

* Missing evidence types
* Stale evidence alerts
* Confidence gaps

**Acceptance Criteria**

* Gap report per service
* Inputs into agents

**Dependencies**
Issue 8

**Labels**
`evidence` `analysis`

---

### Issue 9b — Terminal UI (TUI)

**Description**
Interactive terminal UI for browsing and editing Ravegraph data. Built on Ink (React for the terminal) or similar.

**Capabilities**

* Browse services, evidence, claims
* Drill into readiness scores and gaps
* Edit/add evidence and services interactively
* Keyboard-driven navigation

**Acceptance Criteria**

* `ravegraph tui` launches interactive interface
* Can view and edit all entities from Phase 1–2
* Built on shared domain layer (no logic duplication)

**Dependencies**
Issues 1b, 3, 4, 8

**Labels**
`tui` `cli`

---

# Phase 3 — Deploy Safely & Supply Chain

## Epic: Artifact & Release Intelligence

---

### Issue 10 — Artifact Entity & API

**Fields**

* Digest
* Version
* Build metadata
* Repo linkage

**Acceptance Criteria**

* Artifacts linked to services
* Build lineage stored

**Dependencies**
Issue 2

**Labels**
`supply-chain`

---

### Issue 11 — Release Entity & API

**Fields**

* Environment
* Deploy time
* Rollout strategy
* Rollback linkage

**Acceptance Criteria**

* Releases traceable to artifacts
* Deployment history queryable

**Dependencies**
Issue 10

**Labels**
`deploy-safely`

---

### Issue 12 — SBOM Ingestion Pipeline

**Capabilities**

* Accept CycloneDX/SPDX
* Link to artifacts
* Store dependency metadata

**Acceptance Criteria**

* SBOM stored per artifact
* Dependency counts indexed

**Dependencies**
Issue 10

**Labels**
`sbom` `supply-chain`

---

### Issue 13 — Vulnerability Ingestion

**Data**

* CVEs
* Severity
* Fix availability

**Acceptance Criteria**

* Vulns linked to artifacts
* Queryable by service/release

**Dependencies**
Issue 12

**Labels**
`security`

---

### Issue 14 — Provenance Ingestion

**Store**

* Attestations
* Builder identity
* Source commit lineage

**Acceptance Criteria**

* Provenance linked to artifacts
* Trust metadata queryable

**Dependencies**
Issue 10

**Labels**
`provenance`

---

### Issue 15 — Supply Chain Scoring Engine

**Scoring Inputs**

* SBOM coverage
* Vulnerabilities
* Policy gates
* Provenance trust

**Acceptance Criteria**

* Supply chain score per service
* Integrated into readiness

**Dependencies**
Issues 12–14

**Labels**
`scoring` `supply-chain`

---

# Phase 4 — Incident Learning System

## Epic: Resilience Intelligence

---

### Issue 16 — Incident Entity & Ingestion

**Fields**

* Severity
* Timeline
* Impact
* Linked releases

**Acceptance Criteria**

* Incidents stored + queryable
* Linked to services

**Labels**
`incident-learning`

---

### Issue 17 — Failure Taxonomy Model

**Domains**

* Deploy
* Runtime
* Dependency
* Detection
* Response
* Systemic

**Acceptance Criteria**

* Incidents classifiable
* Multi-domain tagging supported

**Dependencies**
Issue 16

**Labels**
`taxonomy`

---

### Issue 18 — Incident Evidence Linking

**Link**

* Deploys
* Alerts
* Metrics
* SBOMs

**Acceptance Criteria**

* Evidence timeline reconstructable

**Dependencies**
Issues 3, 16

**Labels**
`incident-learning`

---

### Issue 19 — Learning Agent Framework

**Capabilities**

* Timeline reconstruction
* Causal classification
* Gap detection

**Acceptance Criteria**

* Agent produces analysis report

**Dependencies**
Issues 17–18

**Labels**
`agent`

---

### Issue 20 — Question Proposal Engine

**Outputs**

* New readiness questions
* Evidence requirements

**Acceptance Criteria**

* PR-ready YAML generated

**Dependencies**
Issue 19

**Labels**
`question-model` `agent`

---

### Issue 21 — Control Recommendation Engine

**Outputs**

* Prevent / Detect / Respond / Learn controls

**Acceptance Criteria**

* Controls linked to incidents

**Dependencies**
Issue 19

**Labels**
`controls` `agent`

---

# Phase 5 — Ticket Orchestration & Governance

## Epic: Human Work Integration

---

### Issue 22 — GitHub Issue Creation Agent

**Capabilities**

* Create remediation tickets
* Link incidents + evidence

**Acceptance Criteria**

* Tickets auto-generated from controls

**Dependencies**
Issue 21

**Labels**
`automation`

---

### Issue 23 — Ticket Routing Logic

**Rules**

* Engineering → GitHub
* Governance → Jira
* Model → Git PR

**Acceptance Criteria**

* Routing configurable

**Dependencies**
Issue 22

**Labels**
`governance`

---

### Issue 24 — Question Lifecycle Workflow

**States**

* Proposed
* Approved
* Active
* Deprecated

**Acceptance Criteria**

* Lifecycle tracked via Git + MCP

**Dependencies**
Issue 7

**Labels**
`question-model`

---

### Issue 25 — Work Dashboard API

**Expose**

* Resilience backlog
* Incident-derived work
* Readiness trends

**Acceptance Criteria**

* Dashboard queryable via API

**Dependencies**
Issues 8, 21, 22

**Labels**
`reporting`

---

# Milestones

| Milestone | Scope                 |
| --------- | --------------------- |
| M1        | Evidence Ledger       |
| M2        | Readiness Scoring     |
| M3        | Supply Chain          |
| M4        | Incident Learning     |
| M5        | Governance Automation |

---

# End State

At completion the platform will:

* Store evidence across deploy, supply chain, and operations
* Score readiness continuously
* Learn from incidents
* Propose new controls
* Generate human remediation work
* Evolve its own governance model
