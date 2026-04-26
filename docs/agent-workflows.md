# Agent Workflows

Notewell is designed for agents that can read and edit Markdown. Skills are the
preferred agent entry point when available; initialize them with
`notewell init --agent claude`, `notewell init --agent cursor`, or
`notewell init --agent codex`. CLI commands are helper tools used by skills.

Each selected adapter receives `notewell-ingest`, `notewell-query`, and
`notewell-lint` skills.

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

Use `notewell doctor .` to check required structure and stale indexes. Use
`notewell lint .` to find broken links, missing metadata, and raw files that
need source summaries.

## Optional Features

MCP, embeddings, SQLite, and FlexSearch can improve workflows later, but agents
must not require them. The baseline contract is Markdown plus deterministic JSON
cache files under `.notewell/`.
