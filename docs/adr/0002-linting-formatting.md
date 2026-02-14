# ADR-0002: Linting and Formatting

## Status
Accepted

## Date
2026-02-14

## Context
As part of initializing the MCP platform repository, we need to establish code quality standards and tooling. This includes:
- Consistent code formatting across the codebase
- Linting to catch potential issues early
- Integration with CI/CD pipeline
- Developer tooling for local development

The codebase is TypeScript, so we need tooling that integrates well with TypeScript and the Node.js ecosystem.

## Options Considered

### Linting
- **ESLint** — Industry standard for JavaScript/TypeScript, highly configurable
- **TSLint** — Deprecated, no longer maintained
- **Biome** — Fast, modern alternative but less mature ecosystem

### Formatting
- **Prettier** — De facto standard for JavaScript/TypeScript formatting
- **dprint** — Faster alternative but less adoption
- **ESLint formatting rules** — Possible but Prettier is more comprehensive

### Configuration Approach
- **ESLint v9 flat config** — New modern configuration format
- **ESLint legacy config (.eslintrc)** — Older format, being phased out

## Decision

| Tool | Choice | Version |
|---|---|---|
| Linter | ESLint | v9.x with flat config |
| Formatter | Prettier | Latest |
| Integration | eslint-config-prettier | To avoid conflicts |

### Configuration Details

**ESLint (eslint.config.mjs)**:
- TypeScript ESLint parser and recommended rules
- Prettier integration to avoid rule conflicts
- Custom rules:
  - Unused variables starting with `_` are allowed (common pattern)
  - `any` type produces warnings (not errors) to allow gradual improvement

**Prettier (.prettierrc.json)**:
- Semi-colons: enabled (TypeScript best practice)
- Single quotes: enabled (common JS/TS convention)
- Trailing commas: ES5-compatible
- Print width: 80 characters
- Tab width: 2 spaces

### NPM Scripts
- `npm run lint` — Check for linting issues
- `npm run lint:fix` — Auto-fix linting issues
- `npm run format` — Format all files
- `npm run format:check` — Check formatting without modifying

## Rationale

- **ESLint v9**: Latest version with modern flat config. Easier to understand and maintain than legacy config. TypeScript support is first-class.
- **Prettier**: Industry standard for formatting. Opinionated by design, which reduces bikeshedding. Wide IDE integration.
- **eslint-config-prettier**: Prevents conflicts between ESLint and Prettier. Essential for running both tools together.
- **Warnings for `any`**: Strict enforcement would break existing code. Warnings allow gradual improvement while not blocking development.
- **Underscore prefix pattern**: Common TypeScript convention for intentionally unused parameters (e.g., in callbacks where parameter position matters).

## Consequences

### Positive
- Consistent code style across the codebase
- Automatic formatting removes formatting discussions from code reviews
- Early detection of potential issues via linting
- CI integration ensures code quality standards are maintained
- Good IDE integration for both VSCode and other editors

### Negative
- Additional dependencies (~110 packages)
- Slight learning curve for ESLint v9 flat config (newer format)
- Need to maintain linting configuration as project grows
- Some legitimate code patterns may be flagged (can be addressed with eslint-disable comments when necessary)

### Mitigations
- Keep linting rules practical and developer-friendly
- Use warnings for style preferences, errors for actual issues
- Allow `_` prefix for intentionally unused variables
- Documentation in this ADR for future reference

## Notes

The flat config format (`eslint.config.mjs`) is the future of ESLint and was chosen despite being newer to avoid future migration work. The `.eslintrc` format is deprecated as of ESLint v9.

Initial linting found and fixed several issues:
- Unused variables in map operations
- Unused parameter increments
- All critical errors fixed; remaining warnings are acceptable
