# Notewell

[English README](README.md)

Notewell 是一个轻量的 Markdown-first 个人技术知识库 CLI，面向
LLM 辅助维护场景。它把普通 Markdown 文件作为唯一事实来源，让
Obsidian、Claude、OpenClaw、Cursor 和本地脚本都能直接读取和维护。

## 它解决什么问题

Notewell 帮你维护一个同时适合人类和编码 agent 使用的个人技术 wiki。
你可以把原始资料、沉淀后的知识和 agent 规则分层管理，再通过可重建的
JSON 缓存完成索引、搜索、lint 和 agent 工作流。

基础工作流不依赖数据库、MCP server、embedding 服务或特定编辑器。

## 目录分层

```text
raw/        不可变的原始资料。
wiki/       长期维护的结构化知识。
.notewell/  可重建的 JSON 缓存。
AGENTS.md   通用 Agent 指南。
CLAUDE.md   Claude 专用补充指南。
```

`.notewell/` 是派生缓存，可以删除；运行 `notewell index` 后会从
Markdown 重新生成。

## 环境要求

- Node.js 20 或更高版本
- npm

## 1.0 保证

- Markdown vault 是唯一事实来源。
- JSON index 始终可用，路径为 `.notewell/index.json`。
- MCP 是可选能力。
- Embeddings 是可选能力，包括 SQLite、FlexSearch 或向量服务。
- Claude、OpenClaw 和 Cursor 只依赖 Markdown、`notewell index`、
  `notewell search`、`notewell lint`、`notewell doctor` 就能使用基础工作流。

## 快速开始

使用 `node dist/cli.js` 时需要从项目根目录执行（包含 `package.json` 的目录）：

```bash
cd path/to/notewell-repo
npm install
npm run build
node dist/cli.js init ~/notewell-vault
node dist/cli.js init --agent claude ~/notewell-vault
node dist/cli.js index ~/notewell-vault
node dist/cli.js search "compose performance" ~/notewell-vault
node dist/cli.js lint ~/notewell-vault
node dist/cli.js log --type note "Updated Compose notes" ~/notewell-vault
node dist/cli.js doctor ~/notewell-vault
```

如果已经把包安装为命令行工具，可以用 `notewell` 替代
`node dist/cli.js`。

本地开发时，可以先 link 一次 CLI，然后就能在任意目录运行：

```bash
cd path/to/notewell-repo
npm install
npm run build
npm link
notewell init ~/notewell-vault
notewell init --agent cursor ~/notewell-vault
```

将 `path/to/notewell-repo` 替换为你本机克隆路径。

## 命令说明

- `notewell init [dir]`：创建 `raw/`、`wiki/`、`.notewell/`、根目录
  Agent 指南和初始模板；不会覆盖已有文件。
- `notewell init --agent claude [dir]`：额外生成 Claude 可用的 Notewell
  ingest、query、lint Skills。
- `notewell init --agent cursor [dir]`：额外生成 Cursor 可用的 Notewell
  ingest、query、lint Skills。
- `notewell init --agent codex [dir]`：额外生成 Codex 可用的 Notewell
  ingest、query、lint Skills。
- `notewell index [dir]`：扫描 `wiki/**/*.md`，解析 frontmatter，提取
  wikilinks，构建 backlinks，并写入 JSON 缓存。
- `notewell search "query" [dir]`：读取 `.notewell/index.json`，输出带分数
  和匹配原因的搜索结果。
- `notewell query "query" [dir]`：`notewell search` 的别名，用于回答知识库问题。
- `notewell lint [dir]`：检查无效 frontmatter、缺失元数据、断开的 wikilink、
  孤立页面，以及没有对应 source page 的 raw 文件。
- `notewell log [--type type] "message" [dir]`：向 `wiki/log.md` 追加带日期的日志。
- `notewell doctor [dir]`：检查核心目录、根目录指南、wiki 初始文件和索引新鲜度。

## 推荐工作流

1. 把原始资料放到 `raw/`。
2. 在 `wiki/` 中维护长期有用的总结、概念、分析、问题和 playbook。
3. 使用 wikilink 连接相关页面，例如 `[[wiki/concepts/recomposition]]`。
4. 运行 `notewell index .`。
5. 运行 `notewell lint .`。
6. Agent 需要检索上下文时，运行 `notewell search "query" .`。
7. 重要变更使用 `notewell log --type note "message" .` 记录。

## Agent Skills

Skills 是 coding agent 的首选入口。CLI 命令是 Skills 可以调用的辅助工具，
用于索引、搜索、lint 和日志记录。

`--agent` 可以重复使用，所以一个 vault 可以同时支持多个工具：

```bash
notewell init --agent claude --agent cursor --agent codex ~/notewell-vault
```

每个被选择的 adapter 都会生成完整的 `notewell-ingest`、`notewell-query`
和 `notewell-lint` Skills。`notewell-query` 包含硬规则：Search the vault
before answering。

## Frontmatter

Wiki 页面应包含 frontmatter：

```markdown
---
title: Recomposition
type: concept
summary: Compose recomposition updates UI when state changes.
tags: [android, performance]
updated: 2026-04-27
---
```

`title`、`summary` 和 `tags` 是 lint 检查要求的字段。

## 可选能力

MCP server、embeddings、SQLite 和 FlexSearch 都是可选增强。基础工作流只需要
Markdown 和 JSON。

当前已包含可选 backend hook，可以接受 `--backend flexsearch`；如果未来没有接入
真实高级 backend，它会回退到 JSON index search。

## 开发

```bash
npm install
npm test
npm run test:e2e
npm run build
```

## 更多文档

- `docs/commands.md`：命令参考
- `docs/quickstart.md`：快速设置
- `docs/agent-workflows.md`：Claude、OpenClaw 和 Cursor 工作流
- `docs/obsidian.md`：Obsidian 设置说明
- `docs/search-backends.md`：搜索 backend 行为
- `docs/mcp.md`：可选 MCP 集成说明
