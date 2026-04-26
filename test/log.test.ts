import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, test } from "vitest";

import { appendLogEntry } from "../src/core/log.js";

const createdTempDirs: string[] = [];

function createVault(): string {
  const dir = mkdtempSync(path.join(tmpdir(), "notewell-log-"));
  createdTempDirs.push(dir);
  mkdirSync(path.join(dir, "wiki"), { recursive: true });
  writeFileSync(path.join(dir, "wiki", "log.md"), "# Wiki Log\n", "utf8");
  return dir;
}

afterEach(() => {
  for (const dir of createdTempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("appendLogEntry", () => {
  test("appends a dated note without overwriting existing entries", () => {
    const vaultDir = createVault();

    appendLogEntry(vaultDir, "First note", {
      now: new Date("2026-04-27T08:00:00+08:00"),
    });
    appendLogEntry(vaultDir, "Article title", {
      type: "ingest",
      now: new Date("2026-04-27T09:00:00+08:00"),
    });

    expect(readFileSync(path.join(vaultDir, "wiki", "log.md"), "utf8")).toBe(
      "# Wiki Log\n\n## [2026-04-27] note | First note\n\n## [2026-04-27] ingest | Article title\n",
    );
  });
});
