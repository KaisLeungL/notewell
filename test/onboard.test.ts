import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { runOnboarding, type OnboardPrompts } from "../src/core/onboard.js";

describe("runOnboarding", () => {
  test("creates a vault from interactive answers", async () => {
    const parentDir = mkdtempSync(path.join(tmpdir(), "notewell-onboard-"));
    const vaultDir = path.join(parentDir, "vault");
    const prompts: OnboardPrompts = {
      input: async () => vaultDir,
      checkbox: async () => ["claude", "cursor"],
      select: async () => "general",
      confirm: async () => true,
    };

    const result = await runOnboarding({ prompts, cwd: parentDir });

    expect(result.cancelled).toBe(false);
    expect(result.vaultDir).toBe(vaultDir);
    expect(existsSync(path.join(vaultDir, "AGENTS.md"))).toBe(true);
    expect(
      existsSync(path.join(vaultDir, ".claude/skills/notewell-query/SKILL.md")),
    ).toBe(true);
    expect(
      existsSync(path.join(vaultDir, ".cursor/skills/notewell-query/SKILL.md")),
    ).toBe(true);
    expect(
      existsSync(path.join(vaultDir, "wiki/guides/knowledge-management.md")),
    ).toBe(true);
  });

  test("does not initialize when the user cancels", async () => {
    const parentDir = mkdtempSync(path.join(tmpdir(), "notewell-onboard-cancel-"));
    const vaultDir = path.join(parentDir, "vault");
    const prompts: OnboardPrompts = {
      input: async () => vaultDir,
      checkbox: async () => ["codex"],
      select: async () => "general",
      confirm: async () => false,
    };

    const result = await runOnboarding({ prompts, cwd: parentDir });

    expect(result.cancelled).toBe(true);
    expect(existsSync(vaultDir)).toBe(false);
  });

  test("uses defaults when yes mode is enabled", async () => {
    const vaultDir = mkdtempSync(path.join(tmpdir(), "notewell-onboard-yes-"));
    const prompts: OnboardPrompts = {
      input: async () => {
        throw new Error("input should not be called in yes mode");
      },
      checkbox: async () => {
        throw new Error("checkbox should not be called in yes mode");
      },
      select: async () => {
        throw new Error("select should not be called in yes mode");
      },
      confirm: async () => {
        throw new Error("confirm should not be called in yes mode");
      },
    };

    const result = await runOnboarding({
      prompts,
      cwd: vaultDir,
      yes: true,
      vaultDir,
      agents: ["claude", "cursor", "codex"],
    });

    expect(result.cancelled).toBe(false);
    expect(existsSync(path.join(vaultDir, ".codex/skills/notewell-query/SKILL.md"))).toBe(
      true,
    );
    expect(
      existsSync(path.join(vaultDir, "wiki/guides/knowledge-management.md")),
    ).toBe(true);
  });
});
