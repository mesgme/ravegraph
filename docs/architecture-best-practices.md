# Architecture Best Practices Reference

Best practices referenced in the Ravegraph architecture review (see GitHub issue #36). Organised by topic with links to learn more.

---

## Clean Architecture / Hexagonal Architecture

The core idea: dependencies point inward. Domain logic knows nothing about databases, HTTP, or MCP. Infrastructure adapts to the domain, not the other way around.

```
Outer (infrastructure) → Inner (domain)

  ┌──────────────────────────────┐
  │  Infrastructure (DB, MCP)    │
  │  ┌────────────────────────┐  │
  │  │  Application (use cases)│  │
  │  │  ┌──────────────────┐  │  │
  │  │  │  Domain (entities)│  │  │
  │  │  └──────────────────┘  │  │
  │  └────────────────────────┘  │
  └──────────────────────────────┘
```

**Key resources:**
- [Khalil Stemmler - Clean Node.js Architecture](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) — The best TypeScript-specific walkthrough of clean architecture. Covers layers, dependency rules, and practical examples.
- [Robert C. Martin - Clean Architecture (book)](https://www.oreilly.com/library/view/clean-architecture-a/9780134494272/) — The original. Chapters 5–7 on SOLID, Chapter 22 on the Clean Architecture.
- [Alistair Cockburn - Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) — The original "ports and adapters" article. Short and foundational.

---

## Repository Pattern

Repositories provide a collection-like interface for accessing domain objects. The domain defines the interface (port); the persistence layer provides the implementation (adapter).

**Why it matters:** Without a repository interface, your domain logic is coupled to your database. You can't test it without a real DB, and you can't swap storage backends.

**What good looks like:**
```typescript
// Domain defines the contract (port)
interface ServiceRepository {
  findById(id: string): Promise<Service | null>;
  save(service: Service): Promise<void>;
}

// Persistence implements it (adapter)
class PostgresServiceRepository implements ServiceRepository {
  constructor(private pool: Pool) {}
  // ...
}
```

**Key resources:**
- [Martin Fowler - Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html) — Original pattern description from Patterns of Enterprise Application Architecture.
- [Khalil Stemmler - Repository Pattern in TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/repository-dto-mapper/) — TypeScript-specific implementation with DTOs and mappers.
- [Cosmic Python - Chapter 2: Repository Pattern](https://www.cosmicpython.com/book/chapter_02_repository.html) — Python-focused but the concepts transfer directly. You already know this one.

---

## Dependency Injection

Pass dependencies into constructors rather than importing them directly. This makes code testable and decoupled.

**Why it matters:** If your MCP server imports `pool` directly, you can't test it without a real database. With DI, you pass in a mock repository instead.

**What good looks like:**
```typescript
// Service accepts its dependencies
class WorkDashboardService {
  constructor(private repo: WorkDashboardRepository) {}

  async getDashboard(): Promise<WorkDashboard> {
    return this.repo.getWorkDashboard();
  }
}

// Production: real DB
const service = new WorkDashboardService(new PostgresRepo(pool));

// Test: mock
const service = new WorkDashboardService(mockRepo);
```

**Key resources:**
- [Mark Seemann - Dependency Injection: Principles, Practices, Patterns (book)](https://www.manning.com/books/dependency-injection-principles-practices-patterns) — The definitive reference. Language-agnostic principles.
- [Khalil Stemmler - Dependency Injection in TypeScript](https://khalilstemmler.com/articles/tutorials/dependency-injection-inversion-explained/) — Practical TypeScript examples.
- [Cosmic Python - Chapter 13: Dependency Injection](https://www.cosmicpython.com/book/chapter_13_dependency_injection.html) — You know this one too. Same ideas, different language.

---

## Domain Error Handling

Create a hierarchy of error classes in the domain layer. Each layer handles errors appropriate to its concerns.

**Why it matters:** Without error types, every `catch` block does `error instanceof Error ? error.message : String(error)`. You can't distinguish "user sent bad input" from "database is down".

**What good looks like:**
```typescript
// Domain errors
class DomainError extends Error { }
class ValidationError extends DomainError { }
class NotFoundError extends DomainError { }

// Repository catches DB errors, throws domain errors
async findById(id: string): Promise<Service> {
  const result = await this.pool.query(...);
  if (result.rows.length === 0) throw new NotFoundError('Service', id);
  return this.mapFromDb(result.rows[0]);
}

// MCP server handles domain errors differently
catch (error) {
  if (error instanceof ValidationError) { /* user error */ }
  if (error instanceof NotFoundError) { /* not found */ }
  /* unexpected error - log and return generic message */
}
```

**Key resources:**
- [Node.js Best Practices - Error Handling](https://github.com/goldbergyoni/nodebestpractices#2-error-handling-practices) — Comprehensive guide. Sections 2.1–2.5 are essential.
- [Khalil Stemmler - Functional Error Handling](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/functional-error-handling/) — Result types and error handling without exceptions.

---

## Value Objects

Small, immutable objects defined by their value rather than identity. Use them to enforce domain invariants.

**Why it matters:** A `score: number` can be -999. A `Score` value object enforces 0–100 at the domain level, not just in the database constraint.

**What good looks like:**
```typescript
class Score {
  readonly value: number;
  constructor(value: number) {
    if (value < 0 || value > 100) {
      throw new ValidationError('Score must be between 0 and 100');
    }
    this.value = value;
  }
}
```

**Key resources:**
- [Eric Evans - Domain-Driven Design (book)](https://www.domainlanguage.com/ddd/) — Chapter 5: Value Objects. The original reference.
- [Khalil Stemmler - Value Objects in TypeScript](https://khalilstemmler.com/articles/typescript-value-object/) — TypeScript-specific implementation.
- [Martin Fowler - Value Object](https://martinfowler.com/bliki/ValueObject.html) — Short summary of the concept.

---

## Type Safety (Avoiding `any`)

TypeScript's value comes from its types. Using `any` opts out of type checking and defeats the purpose of strict mode.

**Common patterns to replace `any`:**

| Instead of | Use |
|---|---|
| `row: any` | Define a `DbRow` interface matching the SQL result |
| `args as any` | Type guards or validation functions |
| `params: any[]` | `params: (string \| number \| boolean \| null)[]` |
| `Record<string, any>` | `Record<string, unknown>` and narrow |

**Key resources:**
- [TypeScript Handbook - Type Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — How to safely narrow `unknown` to specific types.
- [Total TypeScript - `any` Considered Harmful](https://www.totaltypescript.com/tips/dont-use-return-type-any) — Matt Pocock on why and how to avoid `any`.
- [Effective TypeScript (book)](https://effectivetypescript.com/) by Dan Vanderkam — Items 38–43 cover type safety patterns.

---

## Configuration Management

Centralise configuration. Don't scatter env var reads across modules. Don't hardcode secrets.

**Key resources:**
- [The Twelve-Factor App - Config](https://12factor.net/config) — The foundational reference. Config belongs in the environment, not the code.
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) — Why default passwords in source are risky and how to manage secrets properly.

---

## Database Migrations

Track schema changes as versioned migration files. Never modify existing migrations — add new ones.

**Key resources:**
- [Martin Fowler - Evolutionary Database Design](https://martinfowler.com/articles/evodb.html) — The principles behind database migrations.
- [node-pg-migrate](https://github.com/salsita/node-pg-migrate) — Lightweight migration tool for PostgreSQL + Node.js.
- [Kysely Migrations](https://kysely.dev/docs/migrations) — If you choose Kysely as your query builder, migrations are built in.

---

## Structured Logging

Use a logging library that outputs structured (JSON) logs. This makes logs searchable and parseable by log aggregation tools.

**Key resources:**
- [Pino](https://github.com/pinojs/pino) — Fast, low-overhead JSON logger for Node.js. Recommended for production.
- [Node.js Best Practices - Logging](https://github.com/goldbergyoni/nodebestpractices#3-code-style-practices) — Section 3.5 on logging.

---

## Transaction Management

Wrap related database operations in transactions to ensure consistency. If one query fails, roll them all back.

**Key resources:**
- [node-postgres Transactions](https://node-postgres.com/features/transactions) — How to use transactions with the `pg` library you're already using.
- [Martin Fowler - Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html) — The pattern for managing transactions across multiple operations.
- [Cosmic Python - Chapter 6: Unit of Work](https://www.cosmicpython.com/book/chapter_06_uow.html) — You know this one. Same pattern, applies directly.

---

## Testing

Write tests at multiple levels: unit (domain logic), integration (with real DB), and end-to-end (full server).

**Key resources:**
- [Vitest Docs](https://vitest.dev/guide/) — Your test framework. Start here.
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) by Kent C. Dodds — Why integration tests give the most confidence per effort.
- [Cosmic Python - Chapter 1: Domain Model](https://www.cosmicpython.com/book/chapter_01_domain_model.html) — TDD approach to building domain models. Same workflow applies in TypeScript.

---

## Suggested Reading Order

If you're going to read one thing from each section:

1. [Khalil Stemmler - Clean Node.js Architecture](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) — ties everything together for TypeScript
2. [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) — comprehensive checklist, skim the sections relevant to the issues above
3. [The Twelve-Factor App](https://12factor.net/) — short, foundational, applies to any stack
