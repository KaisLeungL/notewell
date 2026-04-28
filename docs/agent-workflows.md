# Agent Workflows

Notewell is designed for agents that can read and edit Markdown. Skills are the
preferred agent entry point when available; initialize them with
`notewell init --agent claude`, `notewell init --agent cursor`, or
`notewell init --agent codex`. CLI commands are helper tools used by skills.

Each selected adapter receives `notewell-ingest`, `notewell-query`, and
`notewell-lint` skills, plus `notewell-organize` for raw material cleanup before
ingestion.

## Knowledge Lifecycle

All agents should keep one vault model:

```text
Capture -> Organize -> Ingest -> Distill -> Query -> Maintain
```

`notewell onboard` can generate `wiki/guides/knowledge-management.md` so humans
and agents share the same lifecycle language.

## Raw Organization

Use `notewell-organize` when `raw/inbox/` or another raw folder needs cleanup
before ingestion.

1. Inspect `raw/`, especially `raw/inbox/`.
2. Produce a proposed move/rename plan.
3. Ask the user to approve the plan before moving or renaming raw files.
4. Never delete raw files automatically.
5. After approved moves, warn that related `wiki/sources/<raw relative path>.md`
   pages may need to be created or updated.
6. Run `notewell lint .` and log meaningful organization work with
   `notewell log --type organize "summary" .`.

## Ingestion

1. Put original material in `raw/`.
2. Write a source summary in `wiki/sources/`.
3. Link durable concepts, papers, playbooks, and analyses.
4. Run `notewell index .`.
5. Run `notewell lint .`.
6. Add a log entry with `notewell log --type ingest "Source title" .`.

## Query Answering

The `notewell-query` skill has one hard rule: Search the vault before answering.

1. Search first with `notewell search "query" .` or its alias
   `notewell query "query" .`.
2. Read the returned wiki pages and cited raw sources.
3. Answer from evidence.
4. If the answer should persist, update `wiki/`.
5. Run `notewell index .` and `notewell lint .`.

## Maintenance

Use `notewell doctor .` to check required structure, root agent guides, and stale
indexes. Use `notewell lint .` to find broken links, missing metadata, stale
index entries, unresolved knowledge conflicts, and raw files that need source
summaries.

## Optional Features

MCP, embeddings, SQLite, and FlexSearch can improve workflows later, but agents
must not require them. The baseline contract is Markdown plus deterministic JSON
cache files under `.notewell/`.
