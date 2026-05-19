---
name: notewell-organize
description: Use when organizing raw Notewell source material before ingestion.
user-invocable: true
---

# Notewell Organize

Use this skill when the user explicitly asks to organize, sort, rename, file,
or clean up raw material — usually because `raw/` has grown noisy.

**This skill is optional, not a precondition for `notewell-ingest`.** Karpathy's
LLM Wiki pattern keeps `raw/` immutable and lets the wiki layer carry structure.
`notewell-ingest` already accepts any path under `raw/` including `raw/inbox/`.
Trigger organize only when the user wants to tidy up — never auto-run before
ingest, and never tell the user "ingest needs me to run first".

## Safety Contract

1. Read `AGENTS.md` and, when present, `CLAUDE.md`.
2. Never delete raw files automatically.
3. Never move or rename raw files without explicit user approval.
4. Never overwrite a destination path without explicit user approval.
5. If duplicate candidate destinations exist, stop and ask the user.
6. If a raw file already has a matching `wiki/sources/<raw relative path>.md`
   page, include the source page path impact in the plan.
7. If required vault directories are missing, recommend `notewell doctor .`
   before organizing.

## Workflow

1. Inspect `raw/`, with special attention to `raw/inbox/`.
2. Identify candidate groups by source type, topic, project, date, or domain.
3. Produce a proposed move/rename plan before changing anything.
4. Ask the user to approve the plan before moving or renaming raw files.
5. After approval, apply only the approved moves and renames.
6. Warn that related `wiki/sources/<raw relative path>.md` pages may need to be
   created or updated after raw paths change.
7. Run `notewell lint .` to surface raw files without source pages.
8. Log meaningful organization work with
   `notewell log --type organize "<summary>" .`.

## Plan Format

Use this structure:

```markdown
## Raw Organization Plan

### Proposed Moves
| Current path | Proposed path | Reason | Source page impact |
| --- | --- | --- | --- |
| raw/inbox/example.pdf | raw/articles/example.pdf | article source | create wiki/sources/raw/articles/example.pdf.md |

### Needs Approval
- Approve the proposed move/rename plan before I change files.

### Follow-Up
- Run `notewell-ingest` for approved raw files that do not yet have source pages.
- Run `notewell index .` after durable wiki updates.
```

## Completion

Summarize approved moves, skipped conflicts, lint findings, and recommended
follow-up ingestion. If the user does not approve the plan, leave files
unchanged and report the proposed next step.
