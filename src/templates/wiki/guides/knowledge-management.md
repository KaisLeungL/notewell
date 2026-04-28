---
title: Knowledge Management Guide
summary: How to grow one Notewell vault from captured raw material into durable wiki knowledge.
tags: [guide, knowledge-management, lifecycle]
updated: 2026-04-28
---

# Knowledge Management Guide

## Knowledge Lifecycle

Use one Notewell vault for every scenario. The lifecycle is:

```text
Capture -> Organize -> Ingest -> Distill -> Query -> Maintain
```

## Capture

Put original material in `raw/`. Use `raw/inbox/` when speed matters and the
right long-term folder is not obvious yet. Raw files can be articles, PDFs,
book excerpts, exported notes, meeting notes, diary entries, code snippets, or
loose fragments.

Avoid editing raw files into working notes. Treat them as source material that
can be cited, summarized, and reorganized with care.

## Organize

Use `notewell-organize` before ingestion when `raw/inbox/` has grown noisy. The
organize workflow should inspect raw material, propose stable target paths, and
ask for approval before moving or renaming anything.

Good grouping signals include source type, project, topic, domain, and date.
Do not create too many folders before the knowledge stabilizes.

## Ingest

Use `notewell-ingest` to turn selected raw files into source pages under:

```text
wiki/sources/<raw relative path>.md
```

Source pages summarize the raw source, preserve attribution, extract useful
entities and concepts, and link to related wiki pages.

## Distill

Promote only durable knowledge beyond source pages:

- `wiki/concepts/` for reusable concepts.
- `wiki/analyses/` for synthesis across sources.
- `wiki/questions/` for unresolved gaps.
- `wiki/playbooks/` for repeatable procedures.

Programmer learning may promote API patterns, debugging lessons, and design
tradeoffs. Reading notes may promote arguments, themes, and cited evidence.
Diary and reflection notes may promote recurring patterns and open questions.
Fragment knowledge may promote clusters only after several fragments point to
the same durable idea.

## Query

Use `notewell query` or the `notewell-query` skill to search the vault before
answering. Read returned wiki pages first, then follow source links when the
answer depends on evidence.

## Maintain

After meaningful changes, run:

```bash
notewell index .
notewell lint .
notewell log --type note "..."
```

Keep `wiki/index.md` as the navigation map and `wiki/log.md` as the maintenance
timeline. When raw files move, check whether related
`wiki/sources/<raw relative path>.md` pages need to be created or updated.

## Anti-Patterns

- Splitting one knowledge base into separate vault schemas for each scenario.
- Turning raw files into mutable working notes.
- Promoting every source into a top-level concept page.
- Moving or renaming raw files without checking source page path impact.
- Creating a deep folder taxonomy before the material has stabilized.
