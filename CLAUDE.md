# Ravegraph

An MCP-based platform for storing system details for consulting SREs. Readiness scoring, supply chain intelligence, and incident learning.

## Tech Stack

- **Language**: TypeScript
- **Primary interface**: MCP server (`@modelcontextprotocol/sdk`)
- **Human interface**: CLI → TUI → Web UI
- **Database**: PostgreSQL (Docker Compose for dev)
- **Dev environment**: Node/TypeScript native (no Docker for the app)

See `docs/adr/` for Architecture Decision Records.
See `docs/DELIVERY_BACKLOG.md` for the full backlog and GitHub issues.

## Development

```bash
# Start database
docker compose up -d

# Install dependencies
npm install

# Run MCP server
npm run dev

# Run CLI
npm run cli -- --help
```

## Git Workflow

- **Never merge PRs** - create PRs and leave merging to the user
- Use `--author="Claude Code <claude-code@anthropic.com>"` for all commits
- **Always use worktrees** for feature branches (never switch branches in main worktree)

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

## Claude Code Rules

- No direct push to main (branch protection enforced)
- All changes via PRs
- Never merge PRs - leave that for the user
- Use `--author="Claude Code <claude-code@anthropic.com>"` on all commits
