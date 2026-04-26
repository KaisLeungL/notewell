# Agent Skills Init Design

## Context

Notewell follows the LLM Wiki pattern: the wiki is a persistent, compounding
artifact maintained by an agent. The three core operations are ingest, query,
and lint. The CLI helps with mechanical work such as indexing, searching,
linting, logging, and doctor checks, but the agent workflow should be driven by
skills.

The current init flow creates `raw/`, `wiki/`, `schema/`, `.notewell/`, and
schema documents. That is not enough for agents that rely on explicit skill
discovery. A query prompt such as `query 什么是反射设计模式` can be treated as a
generic question unless the agent has a skill that forces retrieval from the
vault first.

## Goals

- Let users choose which agent skill adapters to generate during `notewell init`.
- Generate complete skills for each selected agent; skills are the execution
  entry point, not thin wrappers around a shared operation protocol.
- Support the three LLM Wiki operations: ingest, query, and lint.
- Keep the CLI as an optional helper that skills can call when useful.
- Preserve the existing non-overwrite behavior for user files.

## Non-Goals

- Do not create a separate `schema/operations/` protocol layer.
- Do not make Claude the only supported agent.
- Do not require embeddings, MCP, or any external search service.
- Do not remove existing schema files; they remain useful vault guidance.

## CLI Interface

Users select adapters with repeatable `--agent` flags:

```bash
notewell init ~/vault
notewell init --agent claude ~/vault
notewell init --agent cursor ~/vault
notewell init --agent codex ~/vault
notewell init --agent claude --agent cursor ~/vault
```

`notewell init ~/vault` keeps the baseline vault initialization. Each `--agent`
adds that agent's skill directory and three complete skills.

Unknown agent names should fail with a clear error. Re-running init should skip
existing skill files instead of overwriting user-edited skills.

## Generated Layout

For `--agent claude`:

```text
.claude/
  skills/
    notewell-ingest/
      SKILL.md
    notewell-query/
      SKILL.md
    notewell-lint/
      SKILL.md
```

For `--agent cursor`:

```text
.cursor/
  skills/
    notewell-ingest/
      SKILL.md
    notewell-query/
      SKILL.md
    notewell-lint/
      SKILL.md
```

For `--agent codex`:

```text
.codex/
  skills/
    notewell-ingest/
      SKILL.md
    notewell-query/
      SKILL.md
    notewell-lint/
      SKILL.md
```

## Skill Behavior

### `notewell-ingest`

Use when the user asks to ingest, import, process, summarize, or file source
material. The skill should:

- Treat `raw/` as immutable source material after creation.
- Read the new source and relevant existing wiki pages.
- Create or update source summaries under `wiki/sources/`.
- Update durable concept, analysis, question, or playbook pages when the source
  changes the current synthesis.
- Add useful wikilinks and preserve source attribution.
- Run `notewell index .` after wiki changes.
- Run `notewell lint .` before handoff.
- Add a log entry with `notewell log --type ingest "<source title>" .`.

### `notewell-query`

Use when the user asks a knowledge-base question, especially prompts beginning
with `query`, `查询`, or `问知识库`. The skill should:

- Search the vault before answering.
- Prefer `notewell query "<question>" .`; fall back to reading `wiki/index.md`
  and relevant wiki pages if the CLI is unavailable.
- If `.notewell/index.json` is missing or stale, run `notewell index .` before
  relying on search.
- Read returned wiki pages and cited raw sources before synthesizing.
- Clearly distinguish vault-backed evidence from model background knowledge.
- If no vault evidence is found, say so explicitly instead of presenting a
  generic answer as knowledge-base content.
- Offer to file durable answers back into `wiki/questions/`, `wiki/analyses/`,
  or `wiki/playbooks/` when the answer should compound.

### `notewell-lint`

Use when the user asks to lint, review, audit, or health-check the wiki. The
skill should:

- Run `notewell lint .` and inspect the findings.
- Check wiki health beyond mechanical lint: contradictions, stale claims,
  orphan pages, missing cross-references, important concepts without pages, and
  source gaps.
- Fix clear structural issues when the user asks for fixes.
- Rebuild the index with `notewell index .` after durable wiki changes.
- Log meaningful maintenance with `notewell log --type lint "<summary>" .`.

## Implementation Shape

Add an agent adapter registry in init code. Each supported adapter maps an agent
name to a base directory and the three skill template paths. `initVault` should
accept an options object with selected agents, while the CLI parses repeatable
`--agent` flags and passes them through.

The template source can reuse internal helper code to avoid duplication in the
repository, but generated `SKILL.md` files should be complete and usable on
their own inside the vault.

## Testing

- Unit test `initVault(vaultDir, { agents: ["claude"] })` creates the Claude
  skill files.
- Unit test multiple agents create independent skill directories.
- Unit test re-running init skips existing skill files and preserves edits.
- CLI test `notewell init --agent claude --agent cursor <dir>` creates both
  adapter layouts.
- CLI test unknown agent returns a clear error.
- Smoke test templates contain the hard query rule: search the vault before
  answering and disclose when no vault evidence is found.

## Documentation

Update command docs and README examples to show `--agent`. Explain that skills
are the preferred agent entry point, while CLI commands are helper tools used by
the skills.
