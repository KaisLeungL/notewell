# Query Workflow

Query turns a user question into evidence-backed retrieval from the local wiki.
Do not answer from model memory first.

## Triggering

- Explicit trigger: the user runs `/query <question>` or asks to query/search the
  knowledge base.
- Natural-language trigger: the user asks about "my notes", "past decisions",
  "previous notes", "the wiki", "the knowledge base", or similar local-vault
  context.
- Generic knowledge questions do not require durable write back, but still check
  the wiki first when the user frames the question as a vault query.

## Retrieval Pipeline

1. Read `wiki/index.md` first. Use it to identify relevant sources, concepts,
   analyses, questions, playbooks, projects, and domain pages.
2. If `.notewell/index.json` is missing or stale, run `notewell index .` before
   relying on `notewell query` or `notewell search`.
3. Use `notewell query "<question>" .` or `notewell search "<question>" .` as a
   second retrieval pass, not as a replacement for reading `wiki/index.md`.
4. Read the full content of the most relevant returned wiki pages.
5. If the answer depends on source evidence, follow links to `wiki/sources/` and
   referenced `raw/` files. Do not answer from page titles alone.
6. Distinguish confirmed vault evidence, interpretation, uncertainty, and missing
   context.

## Answering

- Answer in the user's language unless asked otherwise.
- Cite wiki evidence with wikilinks such as `[[Page Title]]` or
  `[[wiki/concepts/example]]`.
- For a paragraph based on one page, one wikilink in that paragraph is enough.
  Do not over-cite every sentence.
- When quoting exact source text, use a Markdown block quote and name the source.
- If no relevant vault evidence is found, say:
  "本地知识库中未找到相关内容，以下为通用知识回答："
  Then answer from general knowledge only if useful.
- Never present a generic model answer as if it came from the vault.

## Durable Write Back

When the answer is valuable for future retrieval, ask whether to save it before
writing. A query answer is usually worth saving when it:

- is longer than two paragraphs;
- compares options or synthesizes multiple pages;
- records a decision, rationale, or reusable explanation;
- is likely to be queried again.

If the user already asked to save, persist, write, or file the answer, do not ask
again. Write it under the appropriate local taxonomy:

- `wiki/questions/` for answered questions;
- `wiki/analyses/` for synthesis, comparison, or decision rationale;
- `wiki/playbooks/` for reusable procedures.

Use existing Notewell frontmatter fields:

```yaml
---
title: Page Title
type: analysis
summary: One sentence summary for search and review.
tags: [topic]
sources: [wiki/source-or-page.md]
updated: YYYY-MM-DD
---
```

Add useful wikilinks and register important new durable pages in `wiki/index.md`
when the vault uses the index as a curated entry point.

## Logging and Completion

For meaningful query work, append a query entry to `wiki/log.md` or use:

```bash
notewell log --type query "<short summary>" .
```

After any durable wiki write back:

1. Run `notewell index .`.
2. Run `notewell lint .`.
3. Fix actionable lint findings caused by the query.

In the handoff, list the pages read, whether the answer was saved, and any
remaining uncertainty.
