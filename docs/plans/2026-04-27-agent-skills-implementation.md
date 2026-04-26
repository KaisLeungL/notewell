# Agent Skills Init Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `notewell init --agent <name>` support that generates complete ingest, query, and lint skills for selected coding agents.

**Architecture:** Keep baseline vault initialization unchanged. Add an agent adapter registry that maps supported agents to generated skill template paths. The generated `SKILL.md` files are complete executable workflows; existing `schema/` files remain guidance but are not required by the skills.

**Tech Stack:** TypeScript, Node.js filesystem APIs, Vitest, Markdown templates.

**Commit Policy:** Do not commit during execution unless the user explicitly asks for a commit.

---

### Task 1: Add Agent Option Plumbing to Init

**Files:**
- Modify: `src/core/init.ts`
- Test: `test/init.test.ts`

**Step 1: Write the failing test**

Add a test that calls:

```ts
const result = initVault(vaultDir, { agents: ["claude"] });
expect(result.created).toEqual(
  expect.arrayContaining([
    ".claude/skills/notewell-ingest/SKILL.md",
    ".claude/skills/notewell-query/SKILL.md",
    ".claude/skills/notewell-lint/SKILL.md",
  ]),
);
```

Also assert the files exist and contain operation-specific keywords such as
`notewell-ingest`, `notewell-query`, and `notewell-lint`.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- test/init.test.ts
```

Expected: TypeScript/test failure because `initVault` does not accept options or create agent skills.

**Step 3: Implement minimal option support**

In `src/core/init.ts`:

- Add `export type AgentAdapter = "claude" | "cursor" | "codex";`
- Add `export type InitVaultOptions = { agents?: AgentAdapter[] };`
- Change `initVault(vaultDir: string)` to `initVault(vaultDir: string, options: InitVaultOptions = {})`.
- Keep existing baseline template behavior unchanged.
- Add selected agent skill paths to the files created by init.

**Step 4: Run test to verify it passes**

Run:

```bash
npm test -- test/init.test.ts
```

Expected: all `init` tests pass.

---

### Task 2: Add Complete Skill Templates

**Files:**
- Create: `src/templates/agents/claude/skills/notewell-ingest/SKILL.md`
- Create: `src/templates/agents/claude/skills/notewell-query/SKILL.md`
- Create: `src/templates/agents/claude/skills/notewell-lint/SKILL.md`
- Create: `src/templates/agents/cursor/skills/notewell-ingest/SKILL.md`
- Create: `src/templates/agents/cursor/skills/notewell-query/SKILL.md`
- Create: `src/templates/agents/cursor/skills/notewell-lint/SKILL.md`
- Create: `src/templates/agents/codex/skills/notewell-ingest/SKILL.md`
- Create: `src/templates/agents/codex/skills/notewell-query/SKILL.md`
- Create: `src/templates/agents/codex/skills/notewell-lint/SKILL.md`
- Test: `test/schema-templates.test.ts` or new `test/agent-skills-templates.test.ts`

**Step 1: Write failing template tests**

Create assertions that every supported agent has three skill templates and that:

- Query skills contain `Search the vault before answering`.
- Query skills contain `If no vault evidence is found`.
- Ingest skills mention `raw/`, `wiki/sources/`, `notewell index .`, and `notewell lint .`.
- Lint skills mention `contradictions`, `orphan pages`, `notewell lint .`, and `notewell index .`.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- test/agent-skills-templates.test.ts
```

Expected: failure because templates do not exist.

**Step 3: Add complete skill templates**

Each `SKILL.md` should include:

```md
---
name: notewell-query
description: Use when the user asks a knowledge-base question, especially prompts starting with query, 查询, or 问知识库.
---

# Notewell Query

Search the vault before answering. Do not answer from model knowledge first.
...
```

Repeat for ingest and lint. Keep files complete and self-contained; do not require
the agent to read `schema/operations/*.md`.

**Step 4: Run template tests**

Run:

```bash
npm test -- test/agent-skills-templates.test.ts
```

Expected: all template tests pass.

---

### Task 3: Support Multiple Agent Adapters

**Files:**
- Modify: `src/core/init.ts`
- Test: `test/init.test.ts`

**Step 1: Write failing tests**

Add tests for:

```ts
initVault(vaultDir, { agents: ["claude", "cursor", "codex"] });
```

Assert all three directories exist:

```text
.claude/skills/notewell-query/SKILL.md
.cursor/skills/notewell-query/SKILL.md
.codex/skills/notewell-query/SKILL.md
```

Add a non-overwrite test that edits one generated skill and re-runs init.

**Step 2: Run test to verify it fails or exposes missing behavior**

Run:

```bash
npm test -- test/init.test.ts
```

Expected: failure until all adapter paths and skip behavior are handled.

**Step 3: Implement adapter registry**

In `src/core/init.ts`, add a registry like:

```ts
const AGENT_SKILL_FILES = {
  claude: [
    ".claude/skills/notewell-ingest/SKILL.md",
    ".claude/skills/notewell-query/SKILL.md",
    ".claude/skills/notewell-lint/SKILL.md",
  ],
  cursor: [
    ".cursor/skills/notewell-ingest/SKILL.md",
    ".cursor/skills/notewell-query/SKILL.md",
    ".cursor/skills/notewell-lint/SKILL.md",
  ],
  codex: [
    ".codex/skills/notewell-ingest/SKILL.md",
    ".codex/skills/notewell-query/SKILL.md",
    ".codex/skills/notewell-lint/SKILL.md",
  ],
} as const;
```

Make `readTemplate` resolve agent templates from `src/templates/agents/...` when writing adapter files.

**Step 4: Run tests**

Run:

```bash
npm test -- test/init.test.ts test/agent-skills-templates.test.ts
```

Expected: all targeted tests pass.

---

### Task 4: Add CLI Parsing for Repeatable `--agent`

**Files:**
- Modify: `src/cli.ts`
- Test: `test/cli.test.ts`

**Step 1: Write failing CLI tests**

Add a test that runs:

```ts
await run(["init", "--agent", "claude", "--agent", "cursor", vaultDir]);
```

Assert exit code `0` and generated skill files under `.claude/` and `.cursor/`.

Add a test for:

```ts
await run(["init", "--agent", "unknown", vaultDir]);
```

Assert exit code `1` and stderr contains `unknown agent`.

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- test/cli.test.ts
```

Expected: failure because `init` currently treats `--agent` as the vault path.

**Step 3: Implement parser**

Add a small `parseInitArgs` helper in `src/cli.ts`:

- Collect repeatable `--agent <name>` values.
- Treat the remaining positional argument as `vaultDir`.
- Default `vaultDir` to `process.cwd()`.
- Validate agent names against supported adapters.

Call:

```ts
initVault(parsed.vaultDir, { agents: parsed.agents });
```

**Step 4: Run CLI tests**

Run:

```bash
npm test -- test/cli.test.ts
```

Expected: all CLI tests pass.

---

### Task 5: Update Docs

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `docs/commands.md`
- Modify: `docs/agent-workflows.md`
- Test: `test/docs-smoke.test.ts`

**Step 1: Write failing docs smoke assertions**

Assert docs mention:

- `notewell init --agent claude`
- `notewell init --agent cursor`
- `notewell init --agent codex`
- `notewell-query`
- `Search the vault before answering`

**Step 2: Run docs test**

Run:

```bash
npm test -- test/docs-smoke.test.ts
```

Expected: failure until docs are updated.

**Step 3: Update docs**

Explain:

- Skills are the preferred agent entry point.
- CLI commands are helpers used by skills.
- `--agent` is repeatable.
- Query skills must retrieve from the vault before answering.

**Step 4: Run docs test**

Run:

```bash
npm test -- test/docs-smoke.test.ts
```

Expected: docs smoke tests pass.

---

### Task 6: Full Verification

**Files:**
- All changed implementation, template, test, and doc files.

**Step 1: Run targeted tests**

Run:

```bash
npm test -- test/init.test.ts test/cli.test.ts test/agent-skills-templates.test.ts test/docs-smoke.test.ts
```

Expected: all targeted tests pass.

**Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

**Step 3: Run build**

Run:

```bash
npm run build
```

Expected: TypeScript build succeeds.

**Step 4: Inspect status**

Run:

```bash
git status --short
```

Expected: only intended files are changed or added.

---

## Execution Options

Plan complete and saved to `docs/plans/2026-04-27-agent-skills-implementation.md`.

1. **Subagent-Driven in this session**: dispatch focused implementation tasks and review between checkpoints.
2. **Direct implementation in this session**: implement task-by-task here with TDD checkpoints.
3. **Separate session**: open a new session and execute the saved plan with `executing-plans`.
