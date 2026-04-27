# Referenced Assets Search Design

## Context

Notewell currently keeps durable knowledge in `wiki/`, original material in
`raw/`, and generated search cache data in `.notewell/`. The indexer scans
`wiki/**/*.md`, extracts page metadata and wikilinks, and writes
`.notewell/index.json`. Assets such as images and PDFs live under `raw/`, with
`raw/assets/` documented as the default attachment path, but they are not
represented in search results.

Users need agents to retrieve relevant referenced assets when answering
knowledge-base questions. For example, a query about system architecture should
return the architecture note and include the referenced diagram as supporting
evidence. Users should also be able to search directly for a referenced asset by
file name, path, alias, or alt text.

## Goals

- Keep the baseline local, deterministic, and Markdown-first.
- Index only assets that are referenced by `wiki/**/*.md`.
- Support both Obsidian and standard Markdown asset references.
- Distinguish the syntax used for each asset reference.
- Return referenced assets as evidence on page search results.
- Allow assets to appear as independent search results when the query matches
  asset metadata or reference context.

## Non-Goals

- Do not OCR images or inspect binary contents.
- Do not require an external model, database, vector service, or MCP server.
- Do not index every file under `raw/assets/**` by default.
- Do not add a separate asset search command for the MVP.

## Data Model

Extend `WikiIndex` from a pages-only structure to a pages-plus-assets structure:

```ts
type WikiIndex = {
  pages: IndexRecord[];
  assets: AssetRecord[];
  generated_at: string;
};
```

`AssetRecord` describes the resource file:

```ts
type AssetRecord = {
  path: string;
  title: string;
  asset_kind: "image" | "pdf" | "document" | "other";
  extension: string;
  hash: string;
  referenced_by: string[];
  references: AssetReference[];
};
```

`AssetReference` describes how a wiki page points to the resource:

```ts
type AssetReference = {
  page_slug: string;
  page_path: string;
  reference_syntax:
    | "obsidian-embed"
    | "obsidian-wikilink"
    | "markdown-image"
    | "markdown-link";
  label: string | null;
  raw_target: string;
};
```

The `label` should come from Markdown alt text, Markdown link text, or Obsidian
alias text. This gives users a deterministic way to make image and attachment
content searchable without OCR.

Existing page `links` and `backlinks` continue to model wiki page relationships.
Asset references should not be treated as missing wiki pages.

## Indexing

`notewell index` continues to start from `wiki/**/*.md`. For each page it should:

1. Parse frontmatter and page metadata as it does today.
2. Extract ordinary wiki links for backlinks.
3. Extract asset references from the page body.
4. Resolve local asset paths to normalized POSIX paths.
5. Keep only references that resolve under `raw/assets/**`.
6. Merge all references to the same existing asset into one `AssetRecord`.

Supported syntax:

- `![[raw/assets/arch.png]]` as `obsidian-embed`.
- `[[raw/assets/spec.pdf]]` as `obsidian-wikilink`.
- `![Architecture](../raw/assets/arch.png)` as `markdown-image`.
- `[Spec](../raw/assets/spec.pdf)` as `markdown-link`.

Path handling:

- Support vault-root-relative paths such as `raw/assets/foo.png`.
- Support paths relative to the current wiki page.
- Normalize all stored paths to POSIX form.
- Skip external URLs, anchors, and non-asset local targets.
- Skip missing files from `assets`, but expose them to lint as
  `missing_asset_reference`.

Write the expanded index to `.notewell/index.json`. Add `asset_count` to
`.notewell/manifest.json`.

## Search

`notewell search` and its `query` alias remain the single retrieval entry point.
Search results become a discriminated union:

- `page` results keep the existing fields and add referenced `assets`.
- `asset` results include asset metadata, references, score, and reasons.

Page ranking should preserve the existing behavior. When a page matches, attach
the page's referenced assets so agents can include diagrams, PDFs, or other
attachments as supporting evidence.

Asset ranking should be deterministic and lightweight:

- High score for file name or title matches.
- High score for label matches.
- Medium score for referencing page title, summary, or tag matches.
- Medium or low score for path matches.
- Small boost for assets referenced by multiple pages.

Example CLI output:

```text
[page] wiki/analyses/system-architecture.md (score 142)
title: System Architecture
summary: ...
assets:
- raw/assets/architecture.png [markdown-image: Architecture]
- raw/assets/api-boundary.pdf [obsidian-wikilink: API boundary]

[asset] raw/assets/architecture.png (score 118)
title: architecture.png
asset_kind: image
referenced by:
- wiki/analyses/system-architecture.md [markdown-image: Architecture]
```

## Lint

Add asset-aware lint behavior:

- `[[raw/assets/foo.png]]` should not produce `broken_wikilink` when it is an
  asset reference.
- If the referenced asset does not exist, emit a warning:
  `missing_asset_reference`.
- Do not emit `unreferenced_asset` in the MVP because unreferenced assets are
  intentionally outside the index scope.

## Documentation And Skills

Update user-facing docs:

- `README.md` and `README.zh-CN.md`: referenced assets are indexed and returned
  in search results.
- `docs/obsidian.md`: `raw/assets/` remains the recommended attachment path, and
  both Obsidian and Markdown references are supported.
- `docs/commands.md`: `search/query` may return page and asset results.

Update agent skills:

- `notewell-ingest`: ask agents to add meaningful alias or alt text for important
  images and PDFs.
- `notewell-query`: tell agents to include relevant page assets as evidence when
  useful.
- `notewell-lint`: document `missing_asset_reference`.

## Tests

Add focused coverage:

- Indexer tests for the four supported syntaxes.
- Indexer tests for vault-root-relative and page-relative paths.
- Indexer tests proving only `raw/assets/**` references are indexed.
- Search tests proving page results include assets.
- Search tests proving assets can independently match by file name, path, and
  label.
- Lint tests proving asset links are not broken wikilinks and missing asset files
  produce `missing_asset_reference`.

## Risks

- Search cannot discover visual content unless users provide useful file names,
  alt text, aliases, or referencing page context.
- Referenced-only indexing can miss inbox assets that have not been written into
  wiki pages.
- The `.notewell/index.json` schema expands. Existing consumers that read only
  `pages` should keep working, but typed consumers may need updates.
