import { existsSync, mkdtempSync, symlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, test } from "vitest";

describe("cli entry via symlink", () => {
  test("runs when argv[1] is a symlink to cli.js (npm link style)", () => {
    const repoRoot = process.cwd();
    const cliJs = path.join(repoRoot, "dist", "cli.js");
    if (!existsSync(cliJs)) {
      execFileSync("npm", ["run", "build"], { cwd: repoRoot, stdio: "pipe" });
    }

    const tempDir = mkdtempSync(path.join(tmpdir(), "notewell-cli-symlink-"));
    const linkedCli = path.join(tempDir, "notewell-cli");
    symlinkSync(cliJs, linkedCli);

    const help = execFileSync(process.execPath, [linkedCli, "--help"], {
      encoding: "utf8",
    });
    expect(help).toContain("notewell");
    expect(help).toContain("notewell init");
  });
});
