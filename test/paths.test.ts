import { describe, expect, test } from "vitest";

import {
  isInsideLayer,
  isMarkdownFile,
  normalizePath,
  requiredVaultDirs,
  slugFromWikiPath,
} from "../src/core/paths.js";

describe("paths", () => {
  test("declares required vault directories", () => {
    expect(requiredVaultDirs()).toEqual(["raw", "wiki", ".notewell"]);
  });

  test("converts wiki paths to slugs", () => {
    expect(slugFromWikiPath("wiki/concepts/state-invalidation.md")).toBe(
      "wiki/concepts/state-invalidation",
    );
  });

  test("normalizes windows separators", () => {
    expect(normalizePath("wiki\\concepts\\state.md")).toBe(
      "wiki/concepts/state.md",
    );
  });

  test("identifies markdown files case-insensitively", () => {
    expect(isMarkdownFile("wiki/index.md")).toBe(true);
    expect(isMarkdownFile("wiki/index.MD")).toBe(true);
    expect(isMarkdownFile("wiki/index.txt")).toBe(false);
  });

  test("detects paths inside a vault layer", () => {
    expect(isInsideLayer("wiki/concepts/state.md", "wiki")).toBe(true);
    expect(isInsideLayer("raw/articles/state.md", "wiki")).toBe(false);
    expect(isInsideLayer("wikiish/state.md", "wiki")).toBe(false);
  });
});
