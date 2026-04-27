# Claude Guide

Read `AGENTS.md` first. This file adds Claude-specific execution rules for using
the shared Notewell workflow consistently.

## Operating Posture

- Work in the user's language unless they ask otherwise.
- Treat the vault as a knowledge system, not a scratchpad.
- Prefer small, evidence-backed edits over broad rewrites.
- Keep source material, durable notes, and generated cache files separate.
- When unsure whether a result should persist, ask before writing it back.

## Starting a Task

1. Identify the task type: ingestion, query answering, maintenance, or general
   note editing.
2. Read `AGENTS.md`, then use the focused Notewell skill for the task when
   available.
3. Inspect relevant `wiki/` pages and, when needed, source files under `raw/`.
4. Use `notewell search "<query>" .` when the answer depends on existing wiki
   context.
5. If `.notewell/index.json` is missing or stale, run `notewell index .` before
   relying on search results.

## Write Rules

- `raw/` is read-only unless the user explicitly asks to add or correct source
  material.
- Write durable summaries, concepts, analyses, questions, and playbooks under
  `wiki/`.
- Do not edit `.notewell/` directly. Rebuild it with `notewell index .`.
- Keep frontmatter valid and useful for search: `title`, `type`, `summary`,
  `tags`, and `updated`.
- Add wikilinks to related pages whenever a durable note is created or expanded.
- Preserve source attribution and call out conflicts instead of erasing them.

## Workflow Shortcuts

- Ingestion work follows the `notewell-ingest` skill.
- Query answering follows the `notewell-query` skill.
- Cleanup and health checks follow the `notewell-lint` skill.

## Tool Preference

- Baseline workflow first: Markdown files, JSON index, `notewell search`,
  `notewell index`, `notewell lint`, and explicit write back.
- MCP is optional. Use it only when available and helpful.
- Embeddings are optional. Do not wait on an embeddings service if Markdown and
  the JSON index are sufficient.
- If optional integrations fail, continue with the baseline workflow and mention
  the limitation in the handoff.

## Completion Rules

Before completion:

1. Run `notewell index .` after any durable wiki write back.
2. Run `notewell lint .` before completion.
3. Resolve actionable lint errors caused by the task.
4. Log meaningful durable changes with
   `notewell log --type <type> "<message>" .`.
5. Summarize what changed, what was verified, and any remaining open questions.

Cursor, Claude, OpenClaw, and other agents should all preserve the same baseline
contract: Markdown source files, JSON index, lint, and explicit write back when
durable knowledge changes.
