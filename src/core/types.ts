/**
 * Core domain types shared across the notewell CLI and (eventually) the
 * optional MCP server.
 *
 * This file is deliberately small in v0.1; later tasks add ParsedMarkdown,
 * IndexRecord, SearchResult, LintFinding, DoctorCheck, etc.
 */

/**
 * The two core content layers of a notewell vault. The `.notewell/` directory is
 * a derived cache and is intentionally excluded here because it is rebuildable
 * from Markdown.
 */
export type VaultLayer = "raw" | "wiki";

export type ParsedMarkdown = {
  frontmatter: Record<string, unknown>;
  body: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  parseError?: string;
};

export type IndexRecord = {
  slug: string;
  path: string;
  title: string;
  summary: string | null;
  type: string | null;
  domain: string | null;
  tags: string[];
  links: string[];
  backlinks: string[];
  updated_at: string;
  hash: string;
};

export type AssetReferenceSyntax =
  | "obsidian-embed"
  | "obsidian-wikilink"
  | "markdown-image"
  | "markdown-link";

export type AssetKind = "image" | "pdf" | "document" | "other";

export type AssetReference = {
  page_slug: string;
  page_path: string;
  reference_syntax: AssetReferenceSyntax;
  label: string | null;
  raw_target: string;
};

export type AssetRecord = {
  path: string;
  title: string;
  asset_kind: AssetKind;
  extension: string;
  hash: string;
  referenced_by: string[];
  references: AssetReference[];
};

export type WikiIndex = {
  pages: IndexRecord[];
  assets: AssetRecord[];
  generated_at: string;
};

export type SearchResult = {
  slug: string;
  path: string;
  title: string;
  summary: string | null;
  score: number;
  reasons: string[];
};

export type LintFinding = {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
};

export type DoctorCheck = {
  name: string;
  status: "ok" | "warn" | "fail";
  message: string;
};
