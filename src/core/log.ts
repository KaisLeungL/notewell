import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

export type AppendLogEntryOptions = {
  type?: string;
  now?: Date;
};

export function appendLogEntry(
  vaultDir: string,
  message: string,
  options: AppendLogEntryOptions = {},
): string {
  const type = options.type ?? "note";
  const now = options.now ?? new Date();
  const date = formatDate(now);
  const entry = `## [${date}] ${type} | ${message}\n`;
  const logPath = path.join(vaultDir, "wiki", "log.md");

  mkdirSync(path.dirname(logPath), { recursive: true });
  if (!existsSync(logPath)) {
    writeFileSync(logPath, "# Wiki Log\n", "utf8");
  }

  const separator = needsLeadingBlankLine(logPath) ? "\n" : "";
  appendFileSync(logPath, `${separator}${entry}`, "utf8");
  return entry;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function needsLeadingBlankLine(logPath: string): boolean {
  const content = readFileSync(logPath, "utf8");
  return content.length > 0 && !content.endsWith("\n\n");
}
