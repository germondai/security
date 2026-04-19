import { analyzePassword } from "@germondai/security";
import { defineCommand } from "citty";
import { printError, printRawJson } from "../ui/output.js";
import { readInput } from "../utils/input.js";

export const analyzeCmd = defineCommand({
  meta: { name: "analyze", description: "Analyze a password's strength." },
  args: { input: { type: "string", description: "Password (string, file, or stdin)." } },
  run({ args }) {
    try {
      const pwd = readInput(args.input as string | undefined);
      const r = analyzePassword(pwd);
      printRawJson({
        length: r.length,
        uniqueChars: r.uniqueChars,
        naiveBits: r.naiveBits,
        effectiveBits: r.effectiveBits,
        poolSize: r.poolSize,
        score: r.score,
        label: r.label,
        patterns: r.patterns,
        feedback: r.feedback,
        crackTimes: r.crackTimes,
      });
    } catch (e) {
      printError(String(e));
      process.exitCode = 1;
    }
  },
});
