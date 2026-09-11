---
name: github-work-handoff
description: Persist verified agent-created project work to a dedicated GitHub repository for cross-computer handoff. Use after completing meaningful file changes when the user asks to save, commit, or push, or has established a standing auto-commit convention. Create or reuse one repository per project; never route a new project into an unrelated existing repository.
---

# GitHub Work Handoff

Save each coherent, verified deliverable so another computer can clone or pull the project's own repository and continue.

## One project, one repository

- Never use a fixed repository as the destination for every project.
- First look for `.codex/project-repo.json` or the current clone's `origin`. Reuse it only when it clearly belongs to the active project.
- When a project has no repository, derive a concise repository name from the project goal, check for collisions, and create a new private repository by default. Use public visibility only when the user explicitly requests it.
- Record the chosen repository in `.codex/project-repo.json` and report its URL.
- A new task within the same project uses that repository. A materially different project gets a new repository.

## When to commit

- Commit and push immediately after a meaningful requested deliverable is implemented and verified.
- Treat one coherent result as one commit. Do not commit every scratch edit or broken intermediate state.
- Do not commit previews, caches, temporary files, credentials, API keys, `.env` files, or machine-specific private data.
- Read-only answers, diagnosis, planning, and status checks do not create commits.

The user's standing instruction authorizes ordinary repository creation, commits, and pushes for completed in-scope project work. It does not authorize publishing unrelated files or secrets. Default new repositories to private.

## Safe handoff workflow

1. Identify the active project boundary and its repository mapping. Do not infer that a nearby clone belongs to the project merely because it exists.
2. Inspect `git status`. Preserve unrelated user changes and untracked files; never reset, clean, stash, or stage them.
3. Stage explicit task paths rather than using broad staging such as `git add .` in a mixed working tree.
4. Review the staged file list and diff summary, then commit with a short outcome-oriented message.
5. Push the current branch to the project's `origin`, verify success, and report repository, branch, and commit hash.

Never force-push. If histories diverge, fetch and inspect first. Do not start a conflict-producing rebase or merge over unrelated work without clear authority.

## Cross-computer continuation

Keep this skill at `.codex/skills/github-work-handoff/` in each project repository. A clone can use the repository-local copy; optionally install it globally on another computer for the same behavior across projects.
