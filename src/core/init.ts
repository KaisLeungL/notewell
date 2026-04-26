import {
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizePath, requiredVaultDirs } from "./paths.js";

export type InitVaultResult = {
  created: string[];
  skipped: string[];
};

const TEMPLATE_FILES = [
  "schema/AGENTS.md",
  "schema/CLAUDE.md",
  "schema/ingestion.md",
  "schema/query.md",
  "schema/maintenance.md",
  "schema/taxonomy.md",
  "schema/writing-style.md",
  "wiki/index.md",
  "wiki/log.md",
] as const;

export function initVault(vaultDir: string): InitVaultResult {
  const created: string[] = [];
  const skipped: string[] = [];

  for (const dir of requiredVaultDirs()) {
    const target = path.join(vaultDir, dir);
    if (existsSync(target)) {
      skipped.push(dir);
      continue;
    }
    mkdirSync(target, { recursive: true });
    created.push(dir);
  }

  for (const relativePath of TEMPLATE_FILES) {
    const target = path.join(vaultDir, relativePath);
    if (existsSync(target)) {
      skipped.push(relativePath);
      continue;
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, readTemplate(relativePath), "utf8");
    created.push(relativePath);
  }

  return { created, skipped };
}

function readTemplate(relativePath: string): string {
  for (const dir of templateDirs()) {
    const candidate = path.join(dir, relativePath);
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return readFileSync(candidate, "utf8");
    }
  }
  throw new Error(`Missing template: ${normalizePath(relativePath)}`);
}

function templateDirs(): string[] {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  return [
    path.resolve(moduleDir, "../templates"),
    path.resolve(moduleDir, "../../src/templates"),
  ];
}
