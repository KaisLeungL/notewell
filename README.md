# Notewell

[中文说明](README.zh-CN.md)

Notewell is a lightweight Markdown-first personal technical knowledge base for
LLM-assisted maintenance. It keeps the source of truth in plain files that
Obsidian, Claude, OpenClaw, Cursor, and local scripts can all read.

## What It Does

Notewell helps you maintain a personal technical wiki that is easy for both
humans and coding agents to use. You write normal Markdown files, keep source
material separate from synthesized notes, and rebuild a deterministic JSON cache
for search, linting, and agent workflows.

The baseline workflow has no required database, MCP server, embedding service,
or proprietary editor dependency.

## Layers

```text
raw/        Immutable source material.
wiki/       Durable synthesized knowledge.
.notewell/  Rebuildable JSON cache.
AGENTS.md   Shared agent guidance.
CLAUDE.md   Claude-specific guidance.
```

The cache is derived. Delete `.notewell/` whenever you want; `notewell index`
rebuilds it from Markdown.

## Requirements

- Node.js 20 or newer
- npm

## 1.0 Guarantee

- Markdown vault is the source of truth.
- JSON index is always available through `.notewell/index.json`.
- MCP is optional.
- Embeddings are optional, including SQLite, FlexSearch, or vector services.
- Claude, OpenClaw, and Cursor can use the baseline workflow with only Markdown,
  `notewell index`, `notewell search`, `notewell lint`, and `notewell doctor`.

## Quickstart

Run from the project root when using `node dist/cli.js` (the directory that
contains `package.json`):

```bash
cd path/to/notewell-repo
npm install
npm run build
node dist/cli.js init ~/notewell-vault
node dist/cli.js init --agent claude ~/notewell-vault
node dist/cli.js index ~/notewell-vault
node dist/cli.js search "compose performance" ~/notewell-vault
node dist/cli.js lint ~/notewell-vault
node dist/cli.js log --type note "Updated Compose notes" ~/notewell-vault
node dist/cli.js doctor ~/notewell-vault
```

If the package is installed as a binary, use `notewell` instead of
`node dist/cli.js`.

For local development, you can link the CLI once and then run it from any
directory:

```bash
cd path/to/notewell-repo
npm install
npm run build
npm link
notewell init ~/notewell-vault
notewell init --agent cursor ~/notewell-vault
```

Replace `path/to/notewell-repo` with your own clone path.

## Commands

- `notewell init [dir]`: create `raw/`, `wiki/`, `.notewell/`, root agent
  guides, and starter templates without overwriting existing files.
- `notewell init --agent claude [dir]`: also create Claude skills for the
  Notewell ingest, query, and lint workflows.
- `notewell init --agent cursor [dir]`: also create Cursor skills for the
  Notewell ingest, query, and lint workflows.
- `notewell init --agent codex [dir]`: also create Codex skills for the
  Notewell ingest, query, and lint workflows.
- `notewell index [dir]`: scan `wiki/**/*.md`, parse frontmatter, extract
  wikilinks, build backlinks, and write JSON cache files.
- `notewell search "query" [dir]`: search `.notewell/index.json` and print
  ranked matches with scores and reasons.
- `notewell query "query" [dir]`: alias for `notewell search` when answering
  knowledge-base questions.
- `notewell lint [dir]`: report invalid frontmatter, missing required metadata,
  broken wikilinks, orphan pages, and raw files without source pages.
- `notewell log [--type type] "message" [dir]`: append a dated entry to
  `wiki/log.md`.
- `notewell doctor [dir]`: check required folders, root guide files, wiki
  starter files, and index freshness.

## Recommended Workflow

1. Put original material in `raw/`.
2. Write durable summaries, concepts, analyses, questions, and playbooks in
   `wiki/`.
3. Link related notes with wikilinks such as
   `[[wiki/concepts/recomposition]]`.
4. Run `notewell index .`.
5. Run `notewell lint .`.
6. Use `notewell search "query" .` when an agent needs retrieval context.
7. Record meaningful changes with `notewell log --type note "message" .`.

## Agent Skills

Skills are the preferred entry point for coding agents. CLI commands are helper
tools that skills can call for indexing, search, linting, and logging.

`--agent` is repeatable, so a vault can support multiple tools:

```bash
notewell init --agent claude --agent cursor --agent codex ~/notewell-vault
```

Each selected adapter gets complete `notewell-ingest`, `notewell-query`, and
`notewell-lint` skills. `notewell-query` includes the hard rule: Search the
vault before answering.

## Frontmatter

Wiki pages should include frontmatter:

```markdown
---
title: Recomposition
type: concept
summary: Compose recomposition updates UI when state changes.
tags: [android, performance]
updated: 2026-04-27
---
```

`title`, `summary`, and `tags` are required by lint checks.

## Optional Features

MCP servers, embeddings, SQLite, and FlexSearch are optional future layers. The
baseline workflow only requires Markdown and JSON.

The included optional backend hook can accept `--backend flexsearch`, but it
falls back to JSON index search unless a future package wires in the actual
advanced backend.

## Development

```bash
npm install
npm test
npm run test:e2e
npm run build
```

## More Documentation

- `docs/commands.md`: command reference
- `docs/quickstart.md`: short setup guide
- `docs/agent-workflows.md`: Claude, OpenClaw, and Cursor workflows
- `docs/obsidian.md`: Obsidian setup notes
- `docs/search-backends.md`: search backend behavior
- `docs/mcp.md`: optional MCP integration notes
