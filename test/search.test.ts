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
  const dir = mkdtempSync(path.join(tmpdir(), "notewell-search-"));
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

describe("searchIndex", () => {
  test("ranks title, tag, summary, then body matches", () => {
    const vaultDir = createVault();
    writePage(
      vaultDir,
      "wiki/title.md",
      `---
title: Compose Runtime
summary: Runtime notes.
type: concept
tags: [runtime]
---

Body text.
`,
    );
    writePage(
      vaultDir,
      "wiki/tag.md",
      `---
title: Tagged Page
summary: Tag notes.
type: concept
tags: [compose]
---

Body text.
`,
    );
    writePage(
      vaultDir,
      "wiki/summary.md",
      `---
title: Summary Page
summary: Mentions compose in summary.
type: concept
tags: [summary]
---

Body text.
`,
    );
    writePage(
      vaultDir,
      "wiki/body.md",
      `---
title: Body Page
summary: Body notes.
type: concept
tags: [body]
---

Mentions compose in body.
`,
    );
    buildIndex(vaultDir);

    const results = searchIndex(vaultDir, "compose");

    expect(results.map((result) => result.slug)).toEqual([
      "wiki/title",
      "wiki/tag",
      "wiki/summary",
      "wiki/body",
    ]);
    expect(results[0]?.reasons).toContain("title match");
    expect(results[1]?.reasons).toContain("tag match");
    expect(results[2]?.reasons).toContain("summary match");
    expect(results[3]?.reasons).toContain("body match");
  });
});
