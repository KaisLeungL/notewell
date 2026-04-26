/**
 * Core domain types shared across the llm-wiki CLI and (eventually) the
 * optional MCP server.
 *
 * This file is deliberately small in v0.1; later tasks add ParsedMarkdown,
 * IndexRecord, SearchResult, LintFinding, DoctorCheck, etc.
 */

/**
 * The three core layers of an llm-wiki vault. The fourth directory
 * (`.llm-wiki/`) is a derived cache and is intentionally excluded here
 * because it is rebuildable from these three.
 */
export type VaultLayer = "raw" | "wiki" | "schema";
