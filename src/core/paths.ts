import path from "node:path";

import type { VaultLayer } from "./types.js";

export function requiredVaultDirs(): string[] {
  return ["raw", "wiki", "schema", ".llm-wiki"];
}

export function normalizePath(filePath: string): string {
  return filePath.split(path.win32.sep).join(path.posix.sep);
}

export function slugFromWikiPath(filePath: string): string {
  const normalized = normalizePath(filePath);
  return normalized.toLowerCase().endsWith(".md")
    ? normalized.slice(0, -".md".length)
    : normalized;
}

export function isMarkdownFile(filePath: string): boolean {
  return normalizePath(filePath).toLowerCase().endsWith(".md");
}

export function isInsideLayer(filePath: string, layer: VaultLayer): boolean {
  const normalized = normalizePath(filePath);
  return normalized === layer || normalized.startsWith(`${layer}/`);
}
