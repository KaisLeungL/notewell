---
name: notewell-query
description: Use when answering a question from a Notewell LLM wiki.
---

# Notewell Query

Search the vault before answering. Do not answer from model knowledge first.

Use this skill when the user asks a knowledge-base question, especially prompts
starting with `query`, `查询`, or `问知识库`.

## Workflow

1. Identify the user's question and preserve the original wording.
2. If `.notewell/index.json` is missing or stale, run `notewell index .` before
   relying on search.
3. Run `notewell query "<question>" .` or `notewell search "<question>" .`.
4. Read returned wiki pages and cited raw sources before synthesizing.
5. Answer from vault evidence and cite the relevant wiki or raw files.
6. If no vault evidence is found, say that clearly before adding any model
   background knowledge.
7. When the answer should compound, offer to file it under `wiki/questions/`,
   `wiki/analyses/`, or `wiki/playbooks/`.

Never present a generic model answer as if it came from the vault.
