# Referenced Assets Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add deterministic search support for wiki-referenced assets under `raw/assets/**`.

**Architecture:** Extend the JSON index with asset records extracted from wiki page references. Keep page search behavior intact, attach page assets to page results, and add independent asset search results when the query matches asset metadata or reference context.

**Tech Stack:** TypeScript, Node.js filesystem APIs, Vitest, existing Notewell CLI and JSON index.

---

## Pre-Flight

**Files:**
- Read: `docs/plans/2026-04-27-assets-search-design.md`
- Read: `src/core/indexer.ts`
- Read: `src/core/search.ts`
- Read: `src/core/lint.ts`
- Read: `src/core/types.ts`
- Read: `src/cli.ts`

**Step 1: Confirm clean scope**

Run: `git status --short`

Expected: Only unrelated pre-existing user files may be present. Do not touch `.README.zh-CN.md.swp`.

**Step 2: Run the current suite**

Run: `npm test`

Expected: PASS before feature work begins.

---

## Task 1: Add Asset Domain Types

**Files:**
- Modify: `src/core/types.ts`

**Step 1: Write the type changes**

Add asset and discriminated search result types:

```ts
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

export type PageSearchResult = {
  kind: "page";
  slug: string;
  path: string;
  title: string;
  summary: string | null;
  score: number;
  reasons: string[];
  assets: AssetRecord[];
};

export type AssetSearchResult = {
  kind: "asset";
  path: string;
  title: string;
  asset_kind: AssetKind;
  score: number;
  reasons: string[];
  references: AssetReference[];
};

export type SearchResult = PageSearchResult | AssetSearchResult;
```

**Step 2: Run TypeScript**

Run: `npm run build`

Expected: FAIL where existing code constructs `WikiIndex` and `SearchResult` without new fields. This confirms the type boundary is visible.

**Step 3: Commit after this task later**

Do not commit until all compilation errors from this task are resolved in Task 2 and Task 4.

---

## Task 2: Extract Referenced Assets During Indexing

**Files:**
- Modify: `src/core/indexer.ts`
- Test: `test/indexer.test.ts`

**Step 1: Write failing tests for supported syntax**

Add a test that creates:

```text
raw/assets/architecture.png
raw/assets/spec.pdf
wiki/architecture.md
```

The wiki page body should include all four syntaxes:

```markdown
![[raw/assets/architecture.png|系统架构图]]
[[raw/assets/spec.pdf|设计说明]]
![Architecture Diagram](../raw/assets/architecture.png)
[Spec PDF](../raw/assets/spec.pdf)
```

Assertions:

```ts
expect(index.assets).toHaveLength(2);
expect(index.assets.find((asset) => asset.path === "raw/assets/architecture.png"))
  .toMatchObject({
    title: "architecture.png",
    asset_kind: "image",
    extension: ".png",
    referenced_by: ["wiki/architecture"],
  });
expect(
  index.assets.flatMap((asset) =>
    asset.references.map((reference) => reference.reference_syntax),
  ),
).toEqual(
  expect.arrayContaining([
    "obsidian-embed",
    "obsidian-wikilink",
    "markdown-image",
    "markdown-link",
  ]),
);
```

**Step 2: Run the focused failing test**

Run: `npm test -- test/indexer.test.ts`

Expected: FAIL because `index.assets` is missing or empty.

**Step 3: Implement asset extraction helpers**

In `src/core/indexer.ts`, add helpers with these responsibilities:

```ts
function extractAssetReferences(
  vaultDir: string,
  pagePath: string,
  pageSlug: string,
  markdown: string,
): AssetReferenceCandidate[] {
  return [
    ...extractObsidianAssetReferences(vaultDir, pagePath, pageSlug, markdown),
    ...extractMarkdownAssetReferences(vaultDir, pagePath, pageSlug, markdown),
  ];
}
```

Use local helper types if they do not need to be exported. Keep asset extraction separate from `extractWikiLinks()` so ordinary page backlinks stay stable.

**Step 4: Resolve asset paths**

Implement path resolution rules:

```ts
function resolveAssetPath(
  vaultDir: string,
  pagePath: string,
  rawTarget: string,
): string | null {
  if (/^[a-z]+:\/\//i.test(rawTarget) || rawTarget.startsWith("#")) {
    return null;
  }

  const cleanTarget = rawTarget.split("#")[0]?.trim();
  if (!cleanTarget) {
    return null;
  }

  const candidate = cleanTarget.startsWith("raw/")
    ? path.join(vaultDir, cleanTarget)
    : path.resolve(path.join(vaultDir, path.dirname(pagePath)), cleanTarget);

  const relative = normalizePath(path.relative(vaultDir, candidate));
  return relative === "raw/assets" || relative.startsWith("raw/assets/")
    ? relative
    : null;
}
```

**Step 5: Build asset records**

In `buildIndex()`, collect all asset references after records are built, merge them by normalized asset path, and keep only existing files.

Use `statSync` and `readFileSync` to compute hashes for existing assets. For binary files, read as a buffer:

```ts
const content = readFileSync(assetPath);
const hash = createHash("sha256").update(content).digest("hex");
```

**Step 6: Write asset count to manifest**

Update `writeCache()` so `.notewell/manifest.json` includes:

```ts
asset_count: index.assets.length
```

**Step 7: Run focused tests**

Run: `npm test -- test/indexer.test.ts`

Expected: PASS.

**Step 8: Run TypeScript**

Run: `npm run build`

Expected: May still fail in search/CLI because `SearchResult` changed. Continue to Task 4.

---

## Task 3: Keep Asset Wikilinks Out Of Broken Page Links

**Files:**
- Modify: `src/core/indexer.ts`
- Modify: `src/core/lint.ts`
- Test: `test/lint.test.ts`

**Step 1: Write failing lint tests**

Add a test fixture or inline temp-vault test proving:

- `[[raw/assets/architecture.png]]` does not produce `broken_wikilink` when the file exists.
- `[[raw/assets/missing.png]]` produces `missing_asset_reference` when the file does not exist.

Expected assertions:

```ts
expect(findings).not.toEqual(
  expect.arrayContaining([
    expect.objectContaining({ code: "broken_wikilink", path: "wiki/architecture.md" }),
  ]),
);
expect(findings).toEqual(
  expect.arrayContaining([
    expect.objectContaining({
      code: "missing_asset_reference",
      path: "wiki/architecture.md",
      severity: "warning",
    }),
  ]),
);
```

**Step 2: Run focused failing tests**

Run: `npm test -- test/lint.test.ts`

Expected: FAIL because asset wikilinks are treated as broken wiki links and missing assets are not checked.

**Step 3: Export or share asset extraction**

Avoid duplicating regex logic. Either:

- Export `extractAssetReferences()` from `src/core/indexer.ts`, or
- Move link parsing helpers to a new `src/core/links.ts`.

Prefer `src/core/links.ts` if the indexer starts getting crowded.

**Step 4: Update `extractWikiLinks()`**

Ensure `extractWikiLinks()` skips Obsidian targets that resolve to `raw/assets/**`. This prevents asset references from being added to page backlinks.

**Step 5: Add lint check**

In `lintWikiPages()`, collect asset reference candidates for each page. If the candidate resolves under `raw/assets/**` but `existsSync(path.join(vaultDir, assetPath))` is false, emit:

```ts
warning(
  "missing_asset_reference",
  relativePath,
  `Asset reference does not exist: ${assetPath}.`,
)
```

**Step 6: Run focused tests**

Run: `npm test -- test/lint.test.ts`

Expected: PASS.

---

## Task 4: Return Page And Asset Search Results

**Files:**
- Modify: `src/core/search.ts`
- Modify: `src/core/operations.ts` only if type imports require it
- Test: `test/search.test.ts`

**Step 1: Write failing page-assets search test**

Create a vault with one page referencing `raw/assets/architecture.png`. Search for a term matching the page title or summary.

Assert:

```ts
const page = results.find(
  (result) => result.kind === "page" && result.slug === "wiki/architecture",
);
expect(page?.assets.map((asset) => asset.path)).toEqual([
  "raw/assets/architecture.png",
]);
```

**Step 2: Write failing independent asset search test**

Search for the asset label or file name:

```ts
const asset = results.find(
  (result) => result.kind === "asset" && result.path === "raw/assets/architecture.png",
);
expect(asset?.reasons).toEqual(expect.arrayContaining(["label match"]));
```

**Step 3: Run focused failing tests**

Run: `npm test -- test/search.test.ts`

Expected: FAIL because search currently returns only page-shaped results.

**Step 4: Update page scoring**

In `scorePage()`, return:

```ts
{
  kind: "page",
  slug: page.slug,
  path: page.path,
  title: page.title,
  summary: page.summary,
  score,
  reasons,
  assets: assetsForPage(index.assets, page.slug),
}
```

Keep existing page weights unchanged.

**Step 5: Add asset scoring**

Add `scoreAsset(index, asset, terms)` that checks:

- `containsAll(asset.title, terms)` as `title match`.
- `containsAll(asset.path, terms)` as `path match`.
- Any reference label match as `label match`.
- Referencing page title, summary, or tag match as `referencing page match`.
- `asset.referenced_by.length > 1` as `reference boost`.

**Step 6: Combine and sort results**

Return:

```ts
return [...pageResults, ...assetResults].sort(
  (a, b) => b.score - a.score || a.path.localeCompare(b.path),
);
```

**Step 7: Run focused tests**

Run: `npm test -- test/search.test.ts`

Expected: PASS.

**Step 8: Run ranking tests**

Run: `npm test -- test/search-ranking.test.ts`

Expected: PASS after updating assertions to filter page results by `kind === "page"` if necessary.

---

## Task 5: Update CLI Output

**Files:**
- Modify: `src/cli.ts`
- Test: `test/cli.test.ts`

**Step 1: Write or update CLI test expectations**

Add expected output shape:

```text
[page] wiki/architecture\t142\ttitle match\tArchitecture
  asset: raw/assets/architecture.png [markdown-image: Architecture Diagram]
[asset] raw/assets/architecture.png\t118\tlabel match\tarchitecture.png
```

Use the repository's existing CLI test style. If tests call `run()` directly, capture stdout the same way existing tests do.

**Step 2: Run focused failing tests**

Run: `npm test -- test/cli.test.ts`

Expected: FAIL until CLI distinguishes result kinds.

**Step 3: Implement result formatting helpers**

Add local helpers in `src/cli.ts`:

```ts
function formatSearchResult(result: SearchResult): string {
  if (result.kind === "asset") {
    return `[asset] ${result.path}\t${result.score}\t${result.reasons.join(", ")}\t${result.title}\n`;
  }

  const lines = [
    `[page] ${result.slug}\t${result.score}\t${result.reasons.join(", ")}\t${result.title}`,
  ];
  for (const asset of result.assets) {
    const reference = asset.references.find((ref) => ref.page_slug === result.slug);
    const label = reference?.label ? `: ${reference.label}` : "";
    lines.push(`  asset: ${asset.path} [${reference?.reference_syntax ?? "referenced"}${label}]`);
  }
  return `${lines.join("\n")}\n`;
}
```

**Step 4: Use formatter in search/query command**

Replace the current one-line output with:

```ts
for (const result of results) {
  process.stdout.write(formatSearchResult(result));
}
```

**Step 5: Run focused tests**

Run: `npm test -- test/cli.test.ts`

Expected: PASS.

---

## Task 6: Update Documentation And Agent Skills

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`
- Modify: `docs/obsidian.md`
- Modify: `docs/commands.md`
- Modify: `src/templates/agents/skills/notewell-ingest/SKILL.md`
- Modify: `src/templates/agents/skills/notewell-query/SKILL.md`
- Modify: `src/templates/agents/skills/notewell-lint/SKILL.md`
- Test: `test/docs-smoke.test.ts`
- Test: `test/agent-skills-templates.test.ts`

**Step 1: Update docs**

Document that:

- Assets should live under `raw/assets/`.
- Only assets referenced from wiki pages are indexed.
- Obsidian and Markdown references are both supported.
- Search may return `[page]` and `[asset]` results.
- Page results may include attached asset evidence.

**Step 2: Update ingest skill**

Add guidance:

```markdown
When referencing important images or PDFs, include meaningful Obsidian aliases
or Markdown alt/link text so local search can find the asset without OCR.
```

**Step 3: Update query skill**

Add guidance:

```markdown
When a page search result includes assets, cite or list the relevant assets as
supporting evidence when they help answer the question.
```

**Step 4: Update lint skill**

Mention `missing_asset_reference` as a warning.

**Step 5: Run docs and skill tests**

Run: `npm test -- test/docs-smoke.test.ts test/agent-skills-templates.test.ts`

Expected: PASS. Update smoke expectations only if they intentionally check changed wording.

---

## Task 7: Full Verification And Cleanup

**Files:**
- Review: all modified files

**Step 1: Run full test suite**

Run: `npm test`

Expected: PASS.

**Step 2: Run TypeScript build**

Run: `npm run build`

Expected: PASS.

**Step 3: Inspect git diff**

Run: `git diff --stat && git diff`

Expected: Only implementation, tests, and docs for referenced asset search are changed. `.README.zh-CN.md.swp` remains untouched and uncommitted.

**Step 4: Commit implementation**

Use a concise message:

```bash
git add src test docs README.md README.zh-CN.md
git commit -m "$(cat <<'EOF'
feat: index referenced assets for search

Return wiki-referenced assets as search evidence and independent results while keeping asset indexing local and deterministic.
EOF
)"
```

**Step 5: Final status**

Run: `git status --short`

Expected: Clean except for any unrelated pre-existing user files.

---

## Implementation Notes

- Keep OCR, image analysis, and external services out of this feature.
- Keep unreferenced assets out of the default index.
- Preserve existing page ranking weights unless tests expose a regression.
- Prefer shared parsing helpers over duplicating Markdown and Obsidian reference parsing in indexer and lint.
- Treat missing asset references as warnings, not errors.
