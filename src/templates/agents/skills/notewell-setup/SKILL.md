---
name: notewell-setup
description: Use to bootstrap a Notewell knowledge vault (raw/, wiki/, GOVERNANCE.md) in a project when no vault exists yet, especially right after installing the notewell skills with `npx skills add`.
user-invocable: true
---

# Notewell Setup

Bootstrap a Notewell knowledge vault in the current project. Run this once,
before using `notewell-ingest`, `notewell-query`, `notewell-lint`, or
`notewell-organize` — those skills all expect a `GOVERNANCE.md` and a `wiki/`
layer to already exist.

This skill is self-contained: it does NOT require the `notewell` npm CLI. You
create the vault structure with plain file writes. If the user does have the
CLI installed, `notewell init .` does the same thing — mention it as a faster
alternative, but never block on it.

## When to Use

- The user just ran `npx skills add <owner>/notewell` and wants to start using
  the skills.
- A skill reported that `GOVERNANCE.md` is missing.
- The user asks to "set up notewell", "create a knowledge vault", or similar.

## Before Writing

1. Determine the project root with the user (default: the current project root).
   The vault is **not** scattered across the project root — it lives in a single
   `knowledge-vault/` subdirectory. All paths below are relative to
   `<project root>/knowledge-vault/`, which is the **vault root**.
   - If the project root already ends in `knowledge-vault`, use it directly
     (do not nest a second `knowledge-vault/` inside it).
2. Check what already exists. If `knowledge-vault/GOVERNANCE.md`,
   `knowledge-vault/raw/`, or `knowledge-vault/wiki/` are already present, do NOT
   overwrite them — report what exists and stop, or only create the missing
   pieces after the user confirms.

## Create the Vault

Create the `knowledge-vault/` directory at the project root, then these
directories inside it if missing:

```
knowledge-vault/
├── raw/        ← Human-written source material (you add files here later)
├── wiki/       ← LLM-generated knowledge (created by notewell-ingest)
└── .notewell/  ← Derived cache (created when an index is built)
```

Then create `knowledge-vault/wiki/index.md` and `knowledge-vault/wiki/log.md` as
empty starter files (a single `# Index` / `# Log` heading is fine).

## Write GOVERNANCE.md

Write the following to `knowledge-vault/GOVERNANCE.md` **only if it does not
already exist**. This is the contract every other notewell skill reads. The
default below follows the Karpathy LLM Wiki pattern (`raw/` immutable and flat,
`wiki/sources/` mirrors raw paths). Tell the user they can edit any section to
fit their project.

````markdown
# Vault Governance

This file is the single source of truth for **how this vault is structured**:
where files live, how they are named, and how the `wiki/` layer is classified.
Notewell skills (`notewell-ingest`, `notewell-query`, `notewell-lint`,
`notewell-organize`) read this file before deciding where to read or write.

The defaults below follow the Karpathy LLM Wiki pattern: `raw/` is immutable and
flat, and the `wiki/` layer carries the structure by **mirroring** raw paths.
Edit any section to fit your project — the skills will follow whatever this file
says.

## Layering

```
<vault>/
├── raw/        ← Human-written source material. Immutable after creation.
├── wiki/       ← LLM-generated via notewell-ingest. Do not hand-edit.
│   ├── sources/    ← One page per raw file (see Source Classification)
│   ├── concepts/   ← Cross-document distilled concepts
│   ├── analyses/   ← Multi-document comparisons and analyses
│   ├── questions/  ← Open questions not yet resolved
│   ├── playbooks/  ← Repeatable procedures
│   ├── index.md    ← Auto-generated catalog
│   └── log.md      ← Append-only change log
└── .notewell/  ← Derived cache. Always rebuildable with `notewell index`.
```

> Rename, add, or remove `wiki/` subdirectories to match your needs. The skills
> use the list above as the set of durable page types they may write to.

## Ownership

| Directory   | Owner                        | Write access                    |
|-------------|------------------------------|---------------------------------|
| `raw/`      | Humans                       | Add new files, never overwrite  |
| `wiki/`     | LLM (`notewell-ingest`)      | Generated output only           |
| `.notewell/`| CLI tool                     | Derived cache, always rebuildable |

## Source Classification

This section tells `notewell-ingest` where to write the source page for a given
raw file, and tells `notewell-query` / `notewell-lint` where to find it.

**Default — mirror path:** the source page lives at
`wiki/sources/<raw relative path>.md`.

Examples:
- `raw/articles/example.md` → `wiki/sources/articles/example.md`
- `raw/inbox/note.md` → `wiki/sources/inbox/note.md`

> To use a role/domain taxonomy instead (e.g. classify by a filename prefix into
> `wiki/sources/<role>/<domain>/<file>.md`), replace this section with your rule
> and give a couple of worked examples. Skills will follow whatever mapping is
> described here.

## Naming Convention

Use stable, descriptive, kebab-case filenames. A common pattern:

```
<topic>[-vN].md
```

- Versioned documents get a new file (`<topic>-v2.md`); never overwrite.
- Date-stamped documents may prefix the date: `YYYY-MM-DD-<topic>.md`.

> If your project encodes a domain or category in the filename (e.g.
> `<domain>-<topic>.md` with a fixed set of domain prefixes), list the allowed
> prefixes here so `notewell-lint` can check naming compliance.

## Rules

1. **raw/ is append-only** — new versions get new files; old files stay.
2. **wiki/ is hands-off** — never hand-edit; re-run ingest to update.
3. **One raw file = one topic** — don't combine unrelated content.
4. **Link, don't isolate** — add wikilinks so new pages connect to existing ones.
5. **Preserve attribution** — never silently overwrite older knowledge; record
   conflicts instead.
````

## Completion

1. List what was created and what was skipped because it already existed.
2. Point the user to the next step: add source files under `knowledge-vault/raw/`,
   then run the `notewell-ingest` skill to compile them into
   `knowledge-vault/wiki/`.
3. If the `notewell` CLI is available, mention `notewell index .` builds the
   search index (it resolves `knowledge-vault/` under the given project root);
   otherwise the skills work on the Markdown files directly.
