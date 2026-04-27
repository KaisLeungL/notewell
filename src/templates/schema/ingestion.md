# Ingestion

Ingestion compiles source material into the persistent LLM wiki. It is not a
plain document summary and it should not leave behind pages that only point at
the raw file.

## Triggering

- Explicit trigger: the user runs `/ingest`, asks to ingest/import/file source
  material, or names a file under `raw/`.
- Scoped trigger: `/ingest <path>` means process only that source path.
- Implicit trigger: phrases such as "ingest this into the knowledge base",
  "import this article", or "整理进 wiki" mean ingestion should run.
- Do not treat ordinary questions or one-off summaries as ingestion unless the
  user asks to persist the result.

## Source Discovery

When no path is provided, scan `raw/` recursively for source files that do not
already have a matching source page under `wiki/sources/`.

- Skip `raw/09-archive/**`, hidden files, hidden directories, and generated
  artifacts.
- Prefer Markdown sources. Read other readable text sources only when the tool
  can extract useful text.
- For PDFs, attempt text extraction. If extraction fails or returns empty
  content, create a source page from available metadata such as filename, path,
  and page count if available.
- Preserve media assets in place. If a source references images, audio, video,
  or other assets, link them from wiki pages with Obsidian-compatible syntax and
  explain how each asset supports the knowledge point.

## Read and Extract

For each source:

1. Read the source file before writing wiki content.
2. Identify the core thesis in one or two sentences.
3. Extract durable entities such as people, companies, products, tools, and
   projects.
4. Extract durable concepts such as frameworks, methods, theories, patterns, and
   named practices.
5. Translate non-Chinese material into concise Simplified Chinese before writing
   wiki pages.
6. Separate source facts, interpretation, uncertainty, and open questions.

## Source Pages

Create or update a source page at the lint-compatible mirror path:

```text
raw/<relative-path>.md
wiki/sources/<relative-path>.md
```

Use existing Notewell frontmatter fields:

```yaml
---
title: "摘要：Source Title"
type: source
summary: One sentence Chinese summary for search and review.
tags: [source]
sources: [raw/path/to/source.md]
updated: YYYY-MM-DD
---
```

Every source page should contain useful wiki content, not only an index. Include
at least:

- `## 核心摘要`: three to five sentences that explain the source, its argument,
  and why it matters.
- `## 关键要点`: durable points worth retrieving later.
- `## 实体与概念`: linked entities and concepts discovered in the source.
- `## 关联连接`: wikilinks to the raw source summary, concepts, analyses,
  playbooks, questions, or related sources.
- `## 开放问题`: uncertainties, missing context, or follow-up questions when
  useful.

## Durable Wiki Pages

When the source changes the long-term knowledge base, create or update durable
pages in the appropriate wiki area:

- Concepts: `wiki/concepts/`
- Analyses and cross-source synthesis: `wiki/analyses/`
- Playbooks: `wiki/playbooks/`
- Questions: `wiki/questions/`
- Domain-specific knowledge: the matching `wiki/domains/` subtree

For every durable page:

1. Keep frontmatter valid and useful: `title`, `type`, `summary`, `tags`,
   `sources`, and `updated`.
2. Add source attribution in `sources`.
3. Merge new information incrementally instead of replacing useful existing
   synthesis.
4. Add wikilinks in `## 关联连接` or an equivalent durable links section so the
   page is not isolated.
5. Use Simplified Chinese unless the user asks otherwise.

## Conflict Handling

If new source content conflicts with an existing wiki page, stop before writing
further synthesis and report:

- the affected page;
- the old claim;
- the new claim;
- the source path for each claim when available.

Ask the user to choose one of these outcomes:

- keep both claims and mark them as a knowledge conflict;
- replace the older claim with the new claim;
- abandon this ingestion.

Continue only after the user decides.

## Completion

After durable wiki changes:

1. Run `notewell index .`.
2. Run `notewell lint .`.
3. Fix lint findings caused by the ingestion.
4. Record meaningful ingestions with
   `notewell log --type ingest "<source title>" .`.
5. Summarize what changed, what was verified, and any conflicts or open
   questions.

Do not move or rewrite files under `raw/` by default. Archive or modify source
files only when the user explicitly asks, and never move shared media assets
that other notes may reference.
