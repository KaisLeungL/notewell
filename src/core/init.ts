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

export type AgentAdapter = "claude" | "cursor" | "codex";
export type KnowledgeGuide =
  | "general"
  | "programmer"
  | "reading"
  | "diary"
  | "fragments";

export type InitVaultOptions = {
  agents?: AgentAdapter[];
  guide?: KnowledgeGuide;
};

type TemplateFile = {
  target: string;
  template: string;
};

const TEMPLATE_FILES: readonly TemplateFile[] = [
  templateFile("AGENTS.md"),
  templateFile("CLAUDE.md"),
  templateFile("GOVERNANCE.md"),
  templateFile("wiki/index.md"),
  templateFile("wiki/log.md"),
];

const GUIDE_FILES: Record<KnowledgeGuide, TemplateFile> = {
  general: templateFile("wiki/guides/knowledge-management.md"),
  programmer: templateFile("wiki/guides/knowledge-management.md"),
  reading: templateFile("wiki/guides/knowledge-management.md"),
  diary: templateFile("wiki/guides/knowledge-management.md"),
  fragments: templateFile("wiki/guides/knowledge-management.md"),
};

const AGENT_SKILL_FILES: Record<AgentAdapter, readonly TemplateFile[]> = {
  claude: [
    agentSkillFile("claude", "notewell-ingest"),
    agentSkillFile("claude", "notewell-query"),
    agentSkillFile("claude", "notewell-lint"),
    agentSkillFile("claude", "notewell-organize"),
  ],
  cursor: [
    agentSkillFile("cursor", "notewell-ingest"),
    agentSkillFile("cursor", "notewell-query"),
    agentSkillFile("cursor", "notewell-lint"),
    agentSkillFile("cursor", "notewell-organize"),
  ],
  codex: [
    agentSkillFile("codex", "notewell-ingest"),
    agentSkillFile("codex", "notewell-query"),
    agentSkillFile("codex", "notewell-lint"),
    agentSkillFile("codex", "notewell-organize"),
  ],
};

export function initVault(
  vaultDir: string,
  options: InitVaultOptions = {},
): InitVaultResult {
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

  for (const file of selectedTemplateFiles(options.agents ?? [], options.guide)) {
    const target = path.join(vaultDir, file.target);
    if (existsSync(target)) {
      skipped.push(file.target);
      continue;
    }
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, readTemplate(file.template), "utf8");
    created.push(file.target);
  }

  return { created, skipped };
}

function selectedTemplateFiles(
  agents: AgentAdapter[],
  guide?: KnowledgeGuide,
): readonly TemplateFile[] {
  return [
    ...TEMPLATE_FILES,
    ...(guide ? [GUIDE_FILES[guide]] : []),
    ...agents.flatMap((agent) => AGENT_SKILL_FILES[agent]),
  ];
}

function templateFile(relativePath: string): TemplateFile {
  return { target: relativePath, template: relativePath };
}

function agentSkillFile(agent: AgentAdapter, skill: string): TemplateFile {
  return {
    target: `.${agent}/skills/${skill}/SKILL.md`,
    template: `agents/skills/${skill}/SKILL.md`,
  };
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
