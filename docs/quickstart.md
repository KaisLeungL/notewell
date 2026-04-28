# Quickstart

## Create a Vault

```bash
notewell onboard ~/wiki
notewell init --guide general ~/wiki
notewell init ~/wiki
notewell index ~/wiki
notewell doctor ~/wiki
```

Use `notewell onboard` when you want an interactive guide for choosing the vault
path, agent skills, and knowledge management guide. Use `notewell init` directly
for scriptable setup, with `--guide general` when you want
`wiki/guides/knowledge-management.md`.

Markdown vault is the source of truth. The JSON index is always available after
`notewell index` and can be rebuilt from `wiki/**/*.md`.

## Knowledge Lifecycle

Notewell uses one vault model:

```text
Capture -> Organize -> Ingest -> Distill -> Query -> Maintain
```

Capture new material in `raw/` or `raw/inbox/`. Use `notewell-organize` to
propose a move/rename plan before ingestion; the skill asks for approval before
moving or renaming raw files. Then use `notewell-ingest` to create source pages
under `wiki/sources/<raw relative path>.md` and distill durable concepts,
analyses, questions, or playbooks.

## Daily Flow

1. Add or read source material in `raw/` or `raw/inbox/`.
2. Organize raw files before ingestion when the inbox grows.
3. Write source summaries and durable pages in `wiki/`.
4. Link related pages with wikilinks.
5. Run `notewell index .`.
6. Run `notewell lint .`.
7. Use `notewell search "query" .` for agent retrieval.

MCP is optional. Embeddings are optional. Claude, OpenClaw, and Cursor can all
use the baseline workflow without extra services.
