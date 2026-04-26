import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { initVault } from "../src/core/init.js";

const createdTempDirs: string[] = [];

function createTempDir(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "llm-wiki-init-"));
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
        "schema",
        ".llm-wiki",
        "wiki/index.md",
        "wiki/log.md",
        "schema/AGENTS.md",
        "schema/CLAUDE.md",
        "schema/ingestion.md",
        "schema/query.md",
        "schema/maintenance.md",
        "schema/taxonomy.md",
        "schema/writing-style.md",
      ]),
    );
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
});
