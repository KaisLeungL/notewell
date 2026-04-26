---
name: notewell-lint
description: Use when reviewing or health-checking a Notewell LLM wiki.
---

# Notewell Lint

Use this skill when the user asks to lint, review, audit, or health-check the
wiki.

## Workflow

1. Run `notewell lint .` and read every finding.
2. Inspect wiki health beyond mechanical lint: contradictions, stale claims,
   orphan pages, missing cross-references, important concepts without pages, and
   source gaps.
3. Fix clear structural issues when the user asks for fixes.
4. Preserve source attribution when resolving conflicts or stale claims.
5. Run `notewell index .` after durable wiki changes.
6. Run `notewell lint .` again before completion.
7. Log meaningful maintenance with `notewell log --type lint "<summary>" .`.

The goal is to keep the wiki healthy as a persistent knowledge artifact.
