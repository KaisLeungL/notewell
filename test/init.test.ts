import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { initVault } from "../src/core/init.js";

const createdTempDirs: string[] = [];

function createTempDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "notewell-init-"));
  createdTempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of createdTempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("initVault", () => {
  test("creates required directories and starter files", () => {
    const vaultDir = createTempDir();

    const result = initVault(vaultDir);

    expect(result.created).toEqual(
      expect.arrayContaining([
        "raw",
        "wiki",
        ".notewell",
        "AGENTS.md",
        "CLAUDE.md",
        "wiki/index.md",
        "wiki/log.md",
      ]),
    );
    expect(result.created).not.toContain("schema");
    expect(existsSync(path.join(vaultDir, "schema"))).toBe(false);
  });

  test("does not overwrite existing user files", () => {
    const vaultDir = createTempDir();
    const indexPath = path.join(vaultDir, "wiki", "index.md");
    initVault(vaultDir);
    writeFileSync(indexPath, "custom index\n", "utf8");

    const result = initVault(vaultDir);

    expect(readFileSync(indexPath, "utf8")).toBe("custom index\n");
    expect(result.skipped).toContain("wiki/index.md");
  });

  test("creates selected knowledge management guide", () => {
    const vaultDir = createTempDir();

    const result = initVault(vaultDir, { guide: "general" });

    expect(result.created).toContain("wiki/guides/knowledge-management.md");
    expect(
      readFileSync(
        path.join(vaultDir, "wiki/guides/knowledge-management.md"),
        "utf8",
      ),
    ).toContain("Knowledge Lifecycle");
  });

  test("does not create guide when no guide is selected", () => {
    const vaultDir = createTempDir();

    initVault(vaultDir);

    expect(
      existsSync(path.join(vaultDir, "wiki/guides/knowledge-management.md")),
    ).toBe(false);
  });

  test("creates Claude skills when requested", () => {
    const vaultDir = createTempDir();

    const result = initVault(vaultDir, { agents: ["claude"] });

    const skillPaths = [
      ".claude/skills/notewell-ingest/SKILL.md",
      ".claude/skills/notewell-query/SKILL.md",
      ".claude/skills/notewell-lint/SKILL.md",
      ".claude/skills/notewell-organize/SKILL.md",
    ];
    expect(result.created).toEqual(expect.arrayContaining(skillPaths));
    for (const skillPath of skillPaths) {
      expect(existsSync(path.join(vaultDir, skillPath))).toBe(true);
    }
    expect(
      readFileSync(
        path.join(vaultDir, ".claude/skills/notewell-ingest/SKILL.md"),
        "utf8",
      ),
    ).toContain("notewell-ingest");
    expect(
      readFileSync(
        path.join(vaultDir, ".claude/skills/notewell-query/SKILL.md"),
        "utf8",
      ),
    ).toContain("notewell-query");
    expect(
      readFileSync(
        path.join(vaultDir, ".claude/skills/notewell-lint/SKILL.md"),
        "utf8",
      ),
    ).toContain("notewell-lint");
    expect(
      readFileSync(
        path.join(vaultDir, ".claude/skills/notewell-organize/SKILL.md"),
        "utf8",
      ),
    ).toContain("notewell-organize");
  });

  test("creates independent skill directories for multiple agents", () => {
    const vaultDir = createTempDir();

    const result = initVault(vaultDir, {
      agents: ["claude", "cursor", "codex"],
    });

    expect(result.created).toEqual(
      expect.arrayContaining([
        ".claude/skills/notewell-query/SKILL.md",
        ".cursor/skills/notewell-query/SKILL.md",
        ".codex/skills/notewell-query/SKILL.md",
        ".claude/skills/notewell-organize/SKILL.md",
        ".cursor/skills/notewell-organize/SKILL.md",
        ".codex/skills/notewell-organize/SKILL.md",
      ]),
    );
    expect(
      existsSync(
        path.join(vaultDir, ".claude/skills/notewell-query/SKILL.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        path.join(vaultDir, ".cursor/skills/notewell-query/SKILL.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(path.join(vaultDir, ".codex/skills/notewell-query/SKILL.md")),
    ).toBe(true);

    const canonicalQuerySkill = readFileSync(
      path.join("src", "templates", "agents", "skills", "notewell-query", "SKILL.md"),
      "utf8",
    );
    expect(
      readFileSync(
        path.join(vaultDir, ".claude/skills/notewell-query/SKILL.md"),
        "utf8",
      ),
    ).toBe(canonicalQuerySkill);
    expect(
      readFileSync(
        path.join(vaultDir, ".cursor/skills/notewell-query/SKILL.md"),
        "utf8",
      ),
    ).toBe(canonicalQuerySkill);
    expect(
      readFileSync(path.join(vaultDir, ".codex/skills/notewell-query/SKILL.md"), "utf8"),
    ).toBe(canonicalQuerySkill);
  });

  test("does not overwrite existing agent skill files", () => {
    const vaultDir = createTempDir();
    const skillPath = path.join(
      vaultDir,
      ".cursor",
      "skills",
      "notewell-query",
      "SKILL.md",
    );
    initVault(vaultDir, { agents: ["cursor"] });
    writeFileSync(skillPath, "custom query skill\n", "utf8");

    const result = initVault(vaultDir, { agents: ["cursor"] });

    expect(readFileSync(skillPath, "utf8")).toBe("custom query skill\n");
    expect(result.skipped).toContain(".cursor/skills/notewell-query/SKILL.md");
  });
});
