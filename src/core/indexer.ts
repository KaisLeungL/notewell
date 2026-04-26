import { createHash } from "node:crypto";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import { parseMarkdown } from "./frontmatter.js";
import { isMarkdownFile, normalizePath, slugFromWikiPath } from "./paths.js";
import type { IndexRecord, WikiIndex } from "./types.js";

export function buildIndex(vaultDir: string): WikiIndex {
  const generatedAt = new Date().toISOString();
  const wikiDir = path.join(vaultDir, "wiki");
  const markdownFiles = listMarkdownFiles(wikiDir);
  const records = markdownFiles.map((filePath) =>
    buildRecord(vaultDir, filePath),
  );
  const backlinks = buildBacklinks(records);
  const pages = records.map((record) => ({
    ...record,
    backlinks: backlinks[record.slug] ?? [],
  }));
  pages.sort((a, b) => a.path.localeCompare(b.path));

  const index: WikiIndex = {
    pages,
    generated_at: generatedAt,
  };

  writeCache(vaultDir, index, backlinks, generatedAt);
  return index;
}

function listMarkdownFiles(rootDir: string): string[] {
  const files: string[] = [];

  function visit(dir: string): void {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        visit(entryPath);
      } else if (entry.isFile() && isMarkdownFile(entry.name)) {
        files.push(entryPath);
      }
    }
  }

  visit(rootDir);
  return files.sort((a, b) => a.localeCompare(b));
}

function buildRecord(vaultDir: string, filePath: string): IndexRecord {
  const content = readFileSync(filePath, "utf8");
  const parsed = parseMarkdown(content);
  const relativePath = normalizePath(path.relative(vaultDir, filePath));
  const stats = statSync(filePath);

  return {
    slug: slugFromWikiPath(relativePath),
    path: relativePath,
    title: parsed.title ?? titleFromPath(relativePath),
    summary: parsed.summary,
    type: stringField(parsed.frontmatter.type),
    domain: stringField(parsed.frontmatter.domain),
    tags: parsed.tags,
    links: extractWikiLinks(parsed.body),
    backlinks: [],
    updated_at:
      stringField(parsed.frontmatter.updated_at) ??
      stringField(parsed.frontmatter.updated) ??
      stats.mtime.toISOString(),
    hash: createHash("sha256").update(content).digest("hex"),
  };
}

function buildBacklinks(records: IndexRecord[]): Record<string, string[]> {
  const backlinks: Record<string, string[]> = {};
  for (const record of records) {
    for (const link of record.links) {
      backlinks[link] ??= [];
      backlinks[link].push(record.slug);
    }
  }

  for (const linkedFrom of Object.values(backlinks)) {
    linkedFrom.sort((a, b) => a.localeCompare(b));
  }

  return backlinks;
}

export function extractWikiLinks(markdown: string): string[] {
  const links = new Set<string>();
  const pattern = /\[\[([^\]]+)\]\]/g;
  for (const match of markdown.matchAll(pattern)) {
    const rawTarget = match[1];
    if (!rawTarget) {
      continue;
    }
    const target = rawTarget.split("|")[0]?.split("#")[0]?.trim();
    if (!target) {
      continue;
    }
    links.add(slugFromWikiPath(normalizePath(target)));
  }
  return [...links].sort((a, b) => a.localeCompare(b));
}

function writeCache(
  vaultDir: string,
  index: WikiIndex,
  backlinks: Record<string, string[]>,
  generatedAt: string,
): void {
  const cacheDir = path.join(vaultDir, ".notewell");
  mkdirSync(cacheDir, { recursive: true });
  writeJson(path.join(cacheDir, "index.json"), index);
  writeJson(path.join(cacheDir, "backlinks.json"), backlinks);
  writeJson(path.join(cacheDir, "manifest.json"), {
    generated_at: generatedAt,
    page_count: index.pages.length,
  });
}

function writeJson(filePath: string, value: unknown): void {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function stringField(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function titleFromPath(filePath: string): string {
  const basename = path.posix.basename(slugFromWikiPath(filePath));
  return basename
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
