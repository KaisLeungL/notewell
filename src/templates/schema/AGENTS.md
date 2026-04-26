# Notewell Agent Guide

Use this vault as a Markdown-first technical knowledge base. Your job is to
turn source material, questions, and maintenance requests into durable,
searchable, well-linked notes without making optional infrastructure a
requirement.

## Core Role

- Preserve original material in `raw/`.
- Maintain durable synthesized knowledge in `wiki/`.
- Keep agent instructions and maintenance rules in `schema/`.
- Treat `.notewell/` as a generated cache that can always be rebuilt.
- Prefer clear Markdown, explicit wikilinks, and concise technical summaries.

## Permission Boundaries

- `raw/` is read-only for agents after source creation. Only add or modify files
  in `raw/` when the user explicitly asks to add or correct source material.
- `wiki/` is the primary write area for source summaries, concepts, analyses,
  questions, playbooks, and project notes.
- `schema/` defines operating rules. Edit it only when the user asks to change
  agent behavior or vault conventions.
- `.notewell/` is derived output. Do not hand-edit cache files; rebuild them
  with `notewell index`.
- Do not delete user notes, raw sources, or schema files unless the user
  explicitly requests it.

## Baseline Workflow

The baseline workflow must work with only Markdown files and the deterministic
JSON cache:

1. Read the relevant Markdown files first.
2. Use `notewell search "<query>" .` when retrieval context is needed.
3. Write durable changes back to `wiki/` when the result should persist.
4. Run `notewell index .` after any wiki write back or structural change.
5. Run `notewell lint .` before completion and resolve actionable errors.
6. Record meaningful durable changes with
   `notewell log --type <type> "<message>" .`.

MCP is optional. Embeddings are optional. Never block the baseline workflow on
an MCP server, database, vector service, FlexSearch, SQLite, or editor-specific
feature.

## Task Routing

- Ingestion work follows `schema/ingestion.md`.
- Query answering follows `schema/query.md`.
- Cleanup and health checks follow `schema/maintenance.md`.
- Naming and placement should follow `schema/taxonomy.md`.
- Prose should follow `schema/writing-style.md`.
- Claude-specific guidance lives in `schema/CLAUDE.md`.

## Wiki Page Contract

Wiki pages should include frontmatter with at least:

```yaml
---
title: Page Title
type: concept
summary: One sentence summary for search and review.
tags: [topic]
updated: YYYY-MM-DD
---
```

Use the local taxonomy when choosing `type` and location. Prefer stable,
descriptive filenames. Add wikilinks to related durable pages so new knowledge
does not become isolated.

## Evidence and Conflict Handling

- Preserve source attribution when summarizing or synthesizing knowledge.
- If sources disagree, do not silently overwrite older knowledge. Add a clear
  conflict note that names the competing claims and links the relevant pages or
  sources.
- Distinguish confirmed facts, interpretation, and open questions.
- If a durable answer is useful for future work, write back to `wiki/questions/`,
  `wiki/analyses/`, `wiki/playbooks/`, or another appropriate wiki area.

## Completion Checklist

Before handing off, verify the applicable items:

- Relevant Markdown was read, not guessed.
- Durable knowledge changes were written under `wiki/`.
- `.notewell/` was rebuilt with `notewell index .` after wiki changes.
- `notewell lint .` was run before completion.
- Meaningful durable changes were logged.
- Optional MCP or embeddings failures did not block the baseline workflow.
