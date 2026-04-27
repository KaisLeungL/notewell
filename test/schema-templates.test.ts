import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const templatesDir = path.join(process.cwd(), "src", "templates");

describe("agent guide templates", () => {
  test("harden multi-agent baseline workflow rules in root guides", () => {
    const combined = [
      "AGENTS.md",
      "CLAUDE.md",
    ]
      .map((file) => readFileSync(path.join(templatesDir, file), "utf8"))
      .join("\n")
      .toLowerCase()
      .replaceAll("`", "");

    expect(combined).toContain("baseline workflow");
    expect(combined).toContain("mcp is optional");
    expect(combined).toContain("embeddings are optional");
    expect(combined).toContain("raw/ is read-only");
    expect(combined).toContain("write back");
    expect(combined).toContain("notewell lint . before completion");
  });
});
