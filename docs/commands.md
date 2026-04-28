# Commands

## `notewell init [dir]`

Creates `raw/`, `wiki/`, `.notewell/`, root agent guide files, and starter wiki
files. Existing files are skipped rather than overwritten.

`--agent` is repeatable and creates complete agent skills:

```bash
notewell init --agent claude ~/vault
notewell init --agent cursor ~/vault
notewell init --agent codex ~/vault
notewell init --agent claude --agent cursor ~/vault
```

Each selected adapter receives `notewell-organize`, `notewell-ingest`,
`notewell-query`, and `notewell-lint` skills. Skills are the agent entry point;
CLI commands are helper tools used by those skills.

`--guide general` creates the user-facing lifecycle guide:

```bash
notewell init --guide general ~/vault
```

The guide is written to `wiki/guides/knowledge-management.md` and explains the
Knowledge Lifecycle:

```text
Capture -> Organize -> Ingest -> Distill -> Query -> Maintain
```

## `notewell onboard [dir]`

Starts an interactive setup guide for choosing the vault directory and agent
skills, then asks which knowledge management guide to generate. It calls the
same initializer as `notewell init` after confirmation.

```bash
notewell onboard ~/vault
notewell onboard --agent cursor ~/vault
notewell onboard --yes --guide general ~/vault
notewell onboard --yes --agent claude --agent cursor ~/vault
```

Use `--yes` for non-interactive setup with the provided path, agent flags, and
default guide. Today `general` is the supported non-interactive guide value.

## `notewell-organize` skill

`notewell-organize` is an agent skill rather than a standalone CLI command. It
scans `raw/`, especially `raw/inbox/`, proposes a move/rename plan, asks the user
to approve it, and then applies only approved raw file moves. It does not ingest
content. After organization, use `notewell-ingest` to create or update
`wiki/sources/<raw relative path>.md` pages.

## `notewell index [dir]`

Scans `wiki/**/*.md`, parses frontmatter, extracts wikilinks, builds backlinks,
records referenced assets, and writes `.notewell/index.json`,
`.notewell/backlinks.json`, and `.notewell/manifest.json`. Only assets referenced
from wiki pages enter the default index; `raw/assets/` files without wiki
references remain raw material.

## `notewell search "query" [dir]`

Reads `.notewell/index.json`, ranks candidate pages, and prints matching pages
and assets with `[page]` or `[asset]` labels, scores, and reasons. Page results
may include referenced asset evidence when relevant. The CLI returns evidence;
the agent does synthesis. `notewell query "query" [dir]` is an alias for the same
knowledge-base lookup.

## `notewell lint [dir]`

Checks missing or invalid metadata, broken wikilinks, orphan pages, missing asset
references (`missing_asset_reference`), and raw files without matching
`wiki/sources/` pages. Errors exit with code `1`; warnings do not fail the
command.

## `notewell log [--type type] "message" [dir]`

Appends a dated entry to `wiki/log.md`, such as:

```markdown
## [2026-04-27] note | Updated Compose performance notes
```

## `notewell doctor [dir]`

Checks core directories, required root guide files, starter wiki files, and whether
`.notewell/index.json` is missing or stale.
