# Ravegraph

A system for storing details about infrastructure and systems, designed for consulting SREs.

## Development

Tech stack TBD.

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
