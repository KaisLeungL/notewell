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

## Lifecycle

```
New document → raw/<...>  (immutable source)
                    ↓
       notewell-ingest → write wiki/sources/<...>.md per Source Classification
                       → distill durable concepts/analyses/questions as warranted
                    ↓
       notewell-lint → health-check links, orphans, index drift, source gaps
                    ↓
       Document becomes outdated → keep, supersede with a new version, or archive
```

## Rules

1. **raw/ is append-only** — new versions get new files; old files stay.
2. **wiki/ is hands-off** — never hand-edit; re-run ingest to update.
3. **One raw file = one topic** — don't combine unrelated content.
4. **Frontmatter recommended** — helps ingest produce better wiki pages:
   ```yaml
   ---
   title: Page Title
   type: source
   summary: One sentence summary for search and review.
   tags: [topic]
   updated: YYYY-MM-DD
   ---
   ```
5. **Link, don't isolate** — add wikilinks so new pages connect to existing ones.
6. **Preserve attribution** — never silently overwrite older knowledge; record
   conflicts instead.
