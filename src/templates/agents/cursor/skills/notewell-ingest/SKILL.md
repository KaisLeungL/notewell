---
name: notewell-ingest
description: Use when ingesting source material into a Notewell LLM wiki.
---

# Notewell Ingest

Use this skill when the user asks to ingest, import, process, summarize, or file
source material into the vault.

## Workflow

1. Confirm which source material should be ingested. Source files usually live
   under `raw/`.
2. Treat `raw/` as immutable after source creation. Do not rewrite source
   material unless the user explicitly asks for a correction.
3. Read relevant existing wiki pages before writing new synthesis.
4. Create or update a source summary under `wiki/sources/`.
5. Update durable concept, analysis, question, or playbook pages when the source
   changes the current synthesis.
6. Preserve source attribution and add useful wikilinks.
7. Run `notewell index .` after durable wiki changes.
8. Run `notewell lint .` before completion and fix issues caused by this ingest.
9. Log meaningful ingests with `notewell log --type ingest "<source title>" .`.

The goal is to compile source material into the persistent wiki, not only to
summarize a document.
