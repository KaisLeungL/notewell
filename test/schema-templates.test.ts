import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const schemaDir = path.join(process.cwd(), "src", "templates", "schema");

describe("agent schema templates", () => {
  test("harden multi-agent baseline workflow rules", () => {
    const combined = [
      "AGENTS.md",
      "CLAUDE.md",
      "ingestion.md",
      "query.md",
      "maintenance.md",
    ]
      .map((file) => readFileSync(path.join(schemaDir, file), "utf8"))
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

  test("defines durable ingestion as a wiki compilation workflow", () => {
    const ingestion = readFileSync(path.join(schemaDir, "ingestion.md"), "utf8");

    expect(ingestion).toContain("Ingestion compiles source material");
    expect(ingestion).toContain("wiki/sources/<relative-path>.md");
    expect(ingestion).toContain("raw/09-archive/**");
    expect(ingestion).toContain("## Conflict Handling");
    expect(ingestion).toContain("notewell log --type ingest");
  });

  test("defines query as evidence-backed wiki retrieval", () => {
    const query = readFileSync(path.join(schemaDir, "query.md"), "utf8");

    expect(query).toContain("Read `wiki/index.md` first");
    expect(query).toContain("notewell query \"<question>\" .");
    expect(query).toContain("[[Page Title]]");
    expect(query).toContain("本地知识库中未找到相关内容，以下为通用知识回答");
    expect(query).toContain("wiki/analyses/");
    expect(query).toContain("notewell log --type query");
  });

  test("defines maintenance as read-only health checks before repair", () => {
    const maintenance = readFileSync(path.join(schemaDir, "maintenance.md"), "utf8");

    expect(maintenance).toContain("Read-Only Default");
    expect(maintenance).toContain("wiki/index.md");
    expect(maintenance).toContain("stale `wiki/index.md` entries");
    expect(maintenance).toContain("## 知识冲突");
    expect(maintenance).toContain("notewell log --type lint");
  });
});
