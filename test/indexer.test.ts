import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { buildIndex } from "../src/core/indexer.js";

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

describe("buildIndex", () => {
  test("indexes wiki pages, links, backlinks, and cache files", () => {
    const vaultDir = copyFixture("basic-vault");

    const index = buildIndex(vaultDir);

    expect(index.pages).toHaveLength(2);
    const recomposition = index.pages.find(
      (page) =>
        page.slug === "wiki/domains/android/jetpack-compose/recomposition",
    );
    expect(recomposition).toMatchObject({
      path: "wiki/domains/android/jetpack-compose/recomposition.md",
      title: "Compose Recomposition",
      summary: "A concept page about Jetpack Compose recomposition and performance.",
      type: "concept",
      domain: "android",
      tags: ["android", "compose", "performance"],
      links: ["wiki/concepts/state-invalidation"],
      backlinks: ["wiki/concepts/state-invalidation"],
      updated_at: "2026-04-27T00:00:00+08:00",
    });
    expect(recomposition?.hash).toMatch(/^[a-f0-9]{64}$/);

    const cacheDir = path.join(vaultDir, ".notewell");
    expect(existsSync(path.join(cacheDir, "index.json"))).toBe(true);
    expect(existsSync(path.join(cacheDir, "backlinks.json"))).toBe(true);
    expect(existsSync(path.join(cacheDir, "manifest.json"))).toBe(true);

    const backlinks = JSON.parse(
      readFileSync(path.join(cacheDir, "backlinks.json"), "utf8"),
    ) as Record<string, string[]>;
    expect(backlinks["wiki/concepts/state-invalidation"]).toEqual([
      "wiki/domains/android/jetpack-compose/recomposition",
    ]);
  });
});
