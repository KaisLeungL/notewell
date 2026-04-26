import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, test } from "vitest";

const agents = ["claude", "cursor", "codex"] as const;
const skills = ["notewell-ingest", "notewell-query", "notewell-lint"] as const;

function readSkill(agent: (typeof agents)[number], skill: (typeof skills)[number]): string {
  return readFileSync(
    path.join("src", "templates", "agents", agent, "skills", skill, "SKILL.md"),
    "utf8",
  );
}

describe("agent skill templates", () => {
  test.each(agents)("defines complete Notewell skills for %s", (agent) => {
    for (const skill of skills) {
      expect(readSkill(agent, skill)).toContain(`name: ${skill}`);
    }
  });

  test.each(agents)("query skill forces vault retrieval for %s", (agent) => {
    const template = readSkill(agent, "notewell-query");

    expect(template).toContain("Search the vault before answering");
    expect(template).toContain("If no vault evidence is found");
    expect(template).toContain("notewell query");
  });

  test.each(agents)("ingest skill compiles sources into the wiki for %s", (agent) => {
    const template = readSkill(agent, "notewell-ingest");

    expect(template).toContain("raw/");
    expect(template).toContain("wiki/sources/");
    expect(template).toContain("notewell index .");
    expect(template).toContain("notewell lint .");
  });

  test.each(agents)("lint skill checks wiki health for %s", (agent) => {
    const template = readSkill(agent, "notewell-lint");

    expect(template).toContain("contradictions");
    expect(template).toContain("orphan pages");
    expect(template).toContain("notewell lint .");
    expect(template).toContain("notewell index .");
  });
});
