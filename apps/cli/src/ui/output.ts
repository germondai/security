import pc from "picocolors";

function panel(text: string, title?: string, color: (s: string) => string = pc.cyan): string {
  const lines = text.split("\n");
  const w = Math.max(...lines.map((l) => [...l].length), (title?.length ?? 0) + 2);
  const bar = "─".repeat(w + 2);
  const header = title
    ? `${color(`┌${bar}┐`)}\n${color("│")} ${pc.bold(title).padEnd(w + 1)}${color("│")}\n${color(`├${bar}┤`)}\n`
    : `${color(`┌${bar}┐`)}\n`;
  const body = lines.map((l) => `${color("│")} ${l.padEnd(w + 1)}${color("│")}`).join("\n");
  const footer = `\n${color(`└${bar}┘`)}`;
  return `${header}${body}${footer}`;
}

export const printSuccess = (t: string, title?: string): void => {
  const expanded = t.replace(/\\n/g, "\n");
  process.stdout.write(`${panel(expanded, title, pc.green)}\n`);
};

export const printInfo = (t: string, title?: string): void => {
  process.stdout.write(`${panel(t, title, pc.cyan)}\n`);
};

export const printError = (t: string, title = "Error"): void => {
  process.stdout.write(`${panel(t, title, pc.red)}\n`);
};

/** Print a string raw, with a single trailing newline. No panel. */
export const printRaw = (t: string): void => {
  process.stdout.write(t.endsWith("\n") ? t : `${t}\n`);
};

/** Print a value as JSON (pretty-printed). No panel. */
export const printRawJson = (t: unknown): void => {
  process.stdout.write(`${JSON.stringify(t, null, 2)}\n`);
};
