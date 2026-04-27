import path from "node:path";

import { checkbox, confirm, input } from "@inquirer/prompts";

import { initVault, type AgentAdapter, type InitVaultResult } from "./init.js";

const AGENT_CHOICES: AgentAdapter[] = ["claude", "cursor", "codex"];

export type OnboardPrompts = {
  input(options: { message: string; default?: string }): Promise<string>;
  checkbox(options: {
    message: string;
    choices: Array<{ name: string; value: AgentAdapter; checked?: boolean }>;
  }): Promise<AgentAdapter[]>;
  confirm(options: { message: string; default?: boolean }): Promise<boolean>;
};

export type RunOnboardingOptions = {
  prompts?: OnboardPrompts;
  cwd?: string;
  yes?: boolean;
  vaultDir?: string;
  agents?: AgentAdapter[];
};

export type OnboardingResult = {
  cancelled: boolean;
  vaultDir: string;
  agents: AgentAdapter[];
  initResult: InitVaultResult | null;
};

export async function runOnboarding(
  options: RunOnboardingOptions = {},
): Promise<OnboardingResult> {
  const cwd = options.cwd ?? process.cwd();
  const prompts = options.prompts ?? createInquirerPrompts();

  const vaultDir = options.yes
    ? path.resolve(options.vaultDir ?? cwd)
    : path.resolve(
        await prompts.input({
          message: "Where should Notewell initialize the vault?",
          default: options.vaultDir ?? cwd,
        }),
      );

  const agents = options.yes
    ? (options.agents ?? [])
    : await prompts.checkbox({
        message: "Which agent skills should be installed?",
        choices: AGENT_CHOICES.map((agent) => ({
          name: agent,
          value: agent,
          checked: options.agents?.includes(agent) ?? false,
        })),
      });

  const shouldInitialize = options.yes
    ? true
    : await prompts.confirm({
        message: `Initialize ${vaultDir} with ${formatAgents(agents)}?`,
        default: true,
      });

  if (!shouldInitialize) {
    return { cancelled: true, vaultDir, agents, initResult: null };
  }

  return {
    cancelled: false,
    vaultDir,
    agents,
    initResult: initVault(vaultDir, { agents }),
  };
}

function createInquirerPrompts(): OnboardPrompts {
  return {
    input,
    checkbox,
    confirm,
  };
}

function formatAgents(agents: AgentAdapter[]): string {
  return agents.length === 0 ? "no agent skills" : `${agents.join(", ")} skills`;
}
