import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { buildIndex } from "../src/core/indexer.js";
import { searchIndex } from "../src/core/search.js";

const createdTempDirs: string[] = [];

function createVault(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "notewell-ranking-"));
  createdTempDirs.push(dir);
  mkdirSync(path.join(dir, "wiki"), { recursive: true });
  return dir;
}

function writePage(vaultDir: string, relativePath: string, markdown: string): void {
  const filePath = path.join(vaultDir, relativePath);
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, markdown, "utf8");
}

afterEach(() => {
  for (const dir of createdTempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("backlink-aware ranking", () => {
  test("boosts pages with more backlinks when text matches are close", () => {
    const vaultDir = createVault();
    writePage(
      vaultDir,
      "wiki/popular.md",
      `---
title: Popular Page
summary: Runtime notes.
type: concept
tags: [runtime]
---

compose body match
`,
    );
    writePage(
      vaultDir,
      "wiki/quiet.md",
      `---
title: Quiet Page
summary: Runtime notes.
type: concept
tags: [runtime]
---

compose body match
`,
    );
    writePage(vaultDir, "wiki/link-a.md", "[[wiki/popular]]\n");
    writePage(vaultDir, "wiki/link-b.md", "[[wiki/popular]]\n");
    buildIndex(vaultDir);

    const results = searchIndex(vaultDir, "compose");
    const pageResults = results.filter((result) => result.kind === "page");

    expect(pageResults[0]?.slug).toBe("wiki/popular");
    expect(pageResults[0]?.reasons).toContain("backlink boost");
    expect(pageResults.find((result) => result.slug === "wiki/popular")?.score).toBeGreaterThan(
      pageResults.find((result) => result.slug === "wiki/quiet")?.score ?? 0,
    );
  });
});
