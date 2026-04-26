import { describe, expect, test } from "vitest";

import { buildHelpText } from "../src/cli.js";

describe("cli help", () => {
  test("prints available commands", () => {
    const help = buildHelpText();
    expect(help).toContain("llm-wiki init");
    expect(help).toContain("llm-wiki index");
    expect(help).toContain("llm-wiki search");
    expect(help).toContain("llm-wiki lint");
    expect(help).toContain("llm-wiki log");
    expect(help).toContain("llm-wiki doctor");
  });
});
