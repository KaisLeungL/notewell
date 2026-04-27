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

  test("source template encourages durable LLM wiki summaries", () => {
    const template = readFileSync(
      path.join("src", "templates", "wiki", "source.md"),
      "utf8",
    );

    expect(template).toContain("## 核心摘要");
    expect(template).toContain("## 关键要点");
    expect(template).toContain("## 实体与概念");
    expect(template).toContain("## 关联连接");
    expect(template).toContain("3-5 句话");
  });
});
