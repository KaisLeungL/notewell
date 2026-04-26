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

export type InitVaultOptions = {
  agents?: AgentAdapter[];
};

type TemplateFile = {
  target: string;
  template: string;
};

const TEMPLATE_FILES: readonly TemplateFile[] = [
  templateFile("schema/AGENTS.md"),
  templateFile("schema/CLAUDE.md"),
  templateFile("schema/ingestion.md"),
  templateFile("schema/query.md"),
  templateFile("schema/maintenance.md"),
  templateFile("schema/taxonomy.md"),
  templateFile("schema/writing-style.md"),
  templateFile("wiki/index.md"),
  templateFile("wiki/log.md"),
];

const AGENT_SKILL_FILES: Record<AgentAdapter, readonly TemplateFile[]> = {
  claude: [
    agentSkillFile("claude", "notewell-ingest"),
    agentSkillFile("claude", "notewell-query"),
    agentSkillFile("claude", "notewell-lint"),
  ],
  cursor: [
    agentSkillFile("cursor", "notewell-ingest"),
    agentSkillFile("cursor", "notewell-query"),
    agentSkillFile("cursor", "notewell-lint"),
  ],
  codex: [
    agentSkillFile("codex", "notewell-ingest"),
    agentSkillFile("codex", "notewell-query"),
    agentSkillFile("codex", "notewell-lint"),
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

  for (const file of selectedTemplateFiles(options.agents ?? [])) {
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

function selectedTemplateFiles(agents: AgentAdapter[]): readonly TemplateFile[] {
  return [
    ...TEMPLATE_FILES,
    ...agents.flatMap((agent) => AGENT_SKILL_FILES[agent]),
  ];
}

function templateFile(relativePath: string): TemplateFile {
  return { target: relativePath, template: relativePath };
}

function agentSkillFile(agent: AgentAdapter, skill: string): TemplateFile {
  return {
    target: `.${agent}/skills/${skill}/SKILL.md`,
    template: `agents/${agent}/skills/${skill}/SKILL.md`,
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
