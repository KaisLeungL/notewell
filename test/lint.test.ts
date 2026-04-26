import { cpSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { lintVault } from "../src/core/lint.js";

const createdTempDirs: string[] = [];

function copyFixture(name: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), `notewell-${name}-`));
  createdTempDirs.push(dir);
  cpSync(path.join("test", "fixtures", name), dir, { recursive: true });
  return dir;
}

afterEach(() => {
  for (const dir of createdTempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("lintVault", () => {
  test("detects invalid metadata, broken links, and orphan pages", () => {
    const findings = lintVault(copyFixture("broken-links"));

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "invalid_frontmatter",
          path: "wiki/invalid-frontmatter.md",
          severity: "error",
        }),
        expect.objectContaining({
          code: "missing_title",
          path: "wiki/missing-fields.md",
          severity: "error",
        }),
        expect.objectContaining({
          code: "missing_summary",
          path: "wiki/missing-fields.md",
          severity: "error",
        }),
        expect.objectContaining({
          code: "missing_tags",
          path: "wiki/missing-fields.md",
          severity: "error",
        }),
        expect.objectContaining({
          code: "broken_wikilink",
          path: "wiki/broken.md",
          severity: "error",
        }),
        expect.objectContaining({
          code: "orphan_page",
          path: "wiki/orphan.md",
          severity: "warning",
        }),
      ]),
    );
  });

  test("detects raw files without source wiki pages", () => {
    const findings = lintVault(copyFixture("raw-without-source"));

    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "raw_without_source",
          path: "raw/articles/compose-performance.md",
          severity: "warning",
        }),
      ]),
    );
  });
});
