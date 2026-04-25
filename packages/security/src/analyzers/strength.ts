import { type CrackTimeEstimate, estimateCrackTimesFromBits } from "./cracktime.js";
import { naiveEntropyBits, shannonEntropy } from "./entropy.js";
import { type DetectedPattern, detectPatterns } from "./patterns.js";

export interface StrengthResult {
  input: string;
  length: number;
  uniqueChars: number;
  shannonBitsPerChar: number;
  naiveBits: number;
  effectiveBits: number;
  poolSize: number;
  score: 0 | 1 | 2 | 3 | 4;
  percent: number;
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  crackTimes: CrackTimeEstimate[];
  patterns: DetectedPattern[];
  feedback: string[];
}

function effectiveEntropyBits(s: string, patterns: DetectedPattern[], poolSize: number): number {
  if (s.length === 0) return 0;
  const DICT_LOG = Math.log2(1000);
  const distinctWords = new Set(
    patterns.filter((p) => p.type === "common").map((p) => p.match.toLowerCase()),
  );
  const dictionaryBits = distinctWords.size * DICT_LOG;
  const patternBits =
    patterns.filter((p) => p.type === "sequence" || p.type === "repeat" || p.type === "date")
      .length * 5;
  const covered = new Array<number>(s.length).fill(0);
  for (const p of patterns) {
    if (p.type !== "common") continue;
    for (let i = 0; i < p.match.length && p.start + i < s.length; i++) {
      const pos = p.start + i;
      if (p.match.length > (covered[pos] ?? 0)) covered[pos] = p.match.length;
    }
  }
  let uncoveredCount = 0;
  for (let i = 0; i < s.length; i++) if ((covered[i] ?? 0) === 0) uncoveredCount++;
  const uncoveredBits = poolSize <= 1 ? 0 : uncoveredCount * Math.log2(poolSize);
  return Math.max(0, dictionaryBits + uncoveredBits - patternBits);
}

function scoreFromBits(
  bits: number,
  length: number,
  wordCount: number,
): { score: 0 | 1 | 2 | 3 | 4; percent: number; label: StrengthResult["label"] } {
  let s: 0 | 1 | 2 | 3 | 4;
  if (bits < 28 || length < 6) s = 0;
  else if (bits < 45) s = 1;
  else if (bits < 65) s = 2;
  else if (bits < 90) s = 3;
  else s = 4;
  if (wordCount >= 1 && s >= 2) s = (s - 1) as 0 | 1 | 2 | 3 | 4;
  if (wordCount >= 3) s = 0;
  const labels: Record<number, StrengthResult["label"]> = {
    0: "Very Weak",
    1: "Weak",
    2: "Fair",
    3: "Strong",
    4: "Very Strong",
  };
  const percent = Math.min(100, Math.max(0, Math.round((bits / 128) * 100)));
  return { score: s, percent, label: labels[s] ?? "Very Weak" };
}

export function analyzePassword(s: string): StrengthResult {
  const patterns = detectPatterns(s);
  const naive = naiveEntropyBits(s);
  const shannon = shannonEntropy(s);
  const unique = new Set(s).size;
  const wordCount = patterns.filter((p) => p.type === "common").length;
  const eff = effectiveEntropyBits(s, patterns, naive.poolSize);
  const { score, percent, label } = scoreFromBits(eff, s.length, wordCount);
  const feedback: string[] = [];
  if (s.length < 12) feedback.push("Use at least 12 characters.");
  if (!/[a-z]/.test(s)) feedback.push("Add lowercase letters.");
  if (!/[A-Z]/.test(s)) feedback.push("Add uppercase letters.");
  if (!/\\d/.test(s)) feedback.push("Add digits.");
  if (!/[^A-Za-z0-9]/.test(s)) feedback.push("Add symbols (!@#$%^&*…).");
  if (wordCount > 0)
    feedback.push(
      `Contains ${wordCount} common word${wordCount > 1 ? "s" : ""} — concatenating dictionary words is far weaker than it looks.`,
    );
  if (patterns.some((p) => p.type === "sequence"))
    feedback.push("Avoid sequential characters (abcd, 1234, qwerty).");
  if (patterns.some((p) => p.type === "repeat"))
    feedback.push("Avoid long runs of the same character.");
  if (patterns.some((p) => p.type === "date")) feedback.push("Avoid dates (years, birthdays).");
  return {
    input: s,
    length: s.length,
    uniqueChars: unique,
    shannonBitsPerChar: shannon,
    naiveBits: naive.bits,
    effectiveBits: eff,
    poolSize: naive.poolSize,
    score,
    percent,
    label,
    crackTimes: estimateCrackTimesFromBits(eff),
    patterns,
    feedback,
  };
}
