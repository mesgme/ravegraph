# Learning Resources

Resources for learning the technologies and patterns used in Ravegraph. Organised by topic, with a suggested learning path at the end.

---

## TypeScript Fundamentals

Coming from Python, these are the best starting points.

### Official Docs

- **[The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)** — The canonical reference. Well-written, designed to be read in a few hours. Start here.
- **[TypeScript Playground](https://www.typescriptlang.org/play)** — Experiment with TypeScript in the browser with instant type feedback.

### Courses & Tutorials

- **[Total TypeScript - Free Tutorials](https://www.totaltypescript.com/tutorials)** by Matt Pocock — Exercise-driven, interactive. The "Beginner's TypeScript" tutorial is free and excellent. Matt Pocock is widely regarded as the best TypeScript educator.
- **[Execute Program - TypeScript](https://www.executeprogram.com/courses/typescript)** — Spaced-repetition interactive course by Gary Bernhardt. Paid (subscription) but outstanding pedagogy.
- **[The Concise TypeScript Book](https://github.com/gibbok/typescript-book)** — Free, open-source, compact guide on GitHub.

### Python-to-TypeScript

- **[A Gentle Introduction to TypeScript for Python Programmers](https://www.kdnuggets.com/a-gentle-introduction-to-typescript-for-python-programmers)** — Directly addresses the transition. Covers type hints vs annotations, dicts/lists/tuples, asyncio vs Promises.

### Key Concepts That Differ from Python

These are the areas where TypeScript goes beyond Python's type system:

- **Structural typing** — If two types have the same shape, they're compatible. No need for inheritance. This is duck typing at the type level.
- **Generics** — Similar to Python's `TypeVar`/`Generic` but far more heavily used. See the [Generics chapter](https://www.typescriptlang.org/docs/handbook/2/generics.html).
- **Type narrowing** — TypeScript tracks types through `if` checks, `typeof`, `instanceof`, and custom type guards. Much more sophisticated than Python's narrowing.
- **Discriminated unions** — Tagged union types with a literal discriminant field. No direct Python equivalent.
- **Mapped types and conditional types** — Type-level programming with no Python equivalent. Lets you transform types programmatically.

---

## TDD with TypeScript

### Vitest (Our Test Framework)

- **[Vitest Official Docs](https://vitest.dev/guide/)** — The primary reference. Jest-compatible API, native TypeScript support, includes [type testing](https://vitest.dev/guide/testing-types) with `expectTypeOf`.
- **[A Beginner's Guide to Unit Testing with Vitest](https://betterstack.com/community/guides/testing/vitest-explained/)** — Practical walkthrough of setup, writing tests, mocking, and coverage.

### TDD Guides

- **[Getting Started with TDD and TypeScript](https://blog.amanpreet.dev/test-driven-development-with-typescript-for-beginners)** — Focused guide on the red-green-refactor cycle with TypeScript.

### Testing Patterns

- Vitest uses `vi.mock()` and `vi.fn()` (identical to Jest's API)
- Constructor injection works naturally with TypeScript interfaces — define a port as an interface, inject the adapter
- Structural typing makes DI cleaner than Python — you don't need abstract base classes, just interfaces

---

## Architecture Patterns (Cosmic Python Equivalent)

There's no single "Cosmic Python for TypeScript" book, but these come closest:

- **[Khalil Stemmler's Articles](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/)** — Clean Architecture, DDD, Repository Pattern, and SOLID principles in TypeScript + Node.js. Free articles. He's essentially the Harry Percival of the TypeScript world.
- **[solidbook.io](https://solidbook.io)** — Khalil's full handbook on software architecture with TypeScript. Paid.
- **[ddd-forum](https://github.com/stemmlerjs/ddd-forum)** — Open-source reference implementation of DDD with TypeScript. Good to read alongside the articles.
- **[Effective TypeScript](https://effectivetypescript.com/)** by Dan Vanderkam — Not architecture-focused, but essential for idiomatic TypeScript. Think "Effective Python" but for TypeScript.

---

## MCP (Model Context Protocol)

### Official Docs

- **[MCP Official Docs](https://modelcontextprotocol.io/docs/sdk)** — The authoritative reference. Start with the [Quickstart: Build a Server](https://modelcontextprotocol.io/docs/develop/build-server).
- **[MCP TypeScript SDK - GitHub](https://github.com/modelcontextprotocol/typescript-sdk)** — The official SDK. The `docs/` directory has detailed server and client guides.
- **[How to Build a Custom MCP Server with TypeScript](https://www.freecodecamp.org/news/how-to-build-a-custom-mcp-server-with-typescript-a-handbook-for-developers/)** — Free, thorough freeCodeCamp tutorial.

### Example Servers to Study

- **[Official Reference Servers](https://github.com/modelcontextprotocol/servers)** — Key ones:
  - **Everything** — Reference/test server demonstrating prompts, resources, and tools
  - **Filesystem** — Secure file operations with access controls
  - **Memory** — Knowledge graph-based persistent memory
- **[awesome-mcp-servers](https://github.com/wong2/awesome-mcp-servers)** — Community-curated list. Good for seeing real-world patterns.

---

## Tooling

### Biome (Lint + Format)

- **[Biome Official Docs](https://biomejs.dev/)** — Our linter and formatter. Single tool replacing ESLint + Prettier.

### Lefthook (Git Hooks)

- **[Lefthook GitHub](https://github.com/evilmartians/lefthook)** — Our git hook manager.

---

## Suggested Learning Path

Given your background (strong Python, Cosmic Python patterns, TDD discipline):

1. **Read the TypeScript Handbook** cover to cover (a few hours)
2. **Do Matt Pocock's free Beginner's TypeScript** tutorial (hands-on practice)
3. **Read the Python-to-TypeScript article** to map your existing mental models
4. **Set up Vitest and practice TDD** from day one on Ravegraph
5. **Read Khalil Stemmler's clean architecture articles** to see how Cosmic Python patterns translate to TypeScript
6. **Follow the MCP quickstart tutorial**, then study the reference servers
