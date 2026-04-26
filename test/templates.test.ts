import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const templates = ["source", "concept", "paper", "playbook", "analysis"] as const;
const requiredFields = ["title", "type", "tags", "summary", "sources", "updated"] as const;

describe("wiki templates", () => {
  test.each(templates)("%s template includes required frontmatter fields", (name) => {
    const template = readFileSync(
      path.join("src", "templates", "wiki", `${name}.md`),
      "utf8",
    );

    for (const field of requiredFields) {
      expect(template).toMatch(new RegExp(`^${field}:`, "m"));
    }
  });
});
