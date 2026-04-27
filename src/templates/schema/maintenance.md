# Maintenance

Keep the vault healthy with read-only inspection first and explicit repair
second. Maintenance should make structural knowledge debt visible before it
compounds.

## Health Checks

Run `notewell lint .` and inspect:

- invalid or missing frontmatter;
- broken wikilinks;
- orphan pages with no meaningful links or backlinks;
- pages that exist under `wiki/` but are not registered in `wiki/index.md`;
- stale `wiki/index.md` entries that point to missing pages;
- pages containing `## 知识冲突`;
- raw source files that do not yet have matching source pages.

## Read-Only Default

Lint, scan, health-check, and review requests are read-only by default. Produce a
structured report before making any changes. Do not modify, delete, rename, or
reclassify files unless the user confirms a repair.

## Repair Workflow

When the user approves fixes:

1. Fix broken wikilinks or stale index entries.
2. Add missing frontmatter.
3. Connect orphan pages when a meaningful relationship exists.
4. Register important wiki pages in `wiki/index.md`.
5. Preserve source attribution when resolving conflicts or stale claims.
6. Rebuild `.notewell/` with `notewell index .` after structural changes.
7. Run `notewell lint .` again before completion and resolve errors caused by
   the repair.
8. Log meaningful maintenance with `notewell log --type lint "<summary>" .`.

MCP is optional and embeddings are optional during maintenance; the JSON index is
the required baseline cache.
