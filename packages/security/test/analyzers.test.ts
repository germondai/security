import { describe, expect, test } from "bun:test";
import { detectPoolSize, naiveEntropyBits, shannonEntropy } from "../src/analyzers/entropy.js";
import { detectPatterns } from "../src/analyzers/patterns.js";
import { analyzePassword } from "../src/analyzers/strength.js";
import { generateUuid, generateUuids } from "../src/generators/uuid.js";

describe("shannonEntropy", () => {
  test("empty string is 0", () => expect(shannonEntropy("")).toBe(0));
  test("single character is 0", () => expect(shannonEntropy("aaaa")).toBe(0));
  test("all-distinct string is log2(n)", () =>
    expect(shannonEntropy("abcd").toFixed(4)).toBe("2.0000"));
});

describe("detectPoolSize", () => {
  test("lowercase only", () => expect(detectPoolSize("hello")).toBe(26));
  test("digits only", () => expect(detectPoolSize("1234")).toBe(10));
  test("mixed classes", () => expect(detectPoolSize("Abc1!")).toBe(26 + 26 + 10 + 32));
});

describe("detectPatterns", () => {
  test("flags common words", () => {
    const r = detectPatterns("password123");
    expect(r.some((p) => p.type === "common")).toBe(true);
  });
  test("flags sequences", () => {
    const r = detectPatterns("helloabcd1234");
    expect(r.some((p) => p.type === "sequence")).toBe(true);
  });
  test("flags repeats", () => {
    const r = detectPatterns("aaaa");
    expect(r.some((p) => p.type === "repeat")).toBe(true);
  });
  test("flags date-like", () => {
    const r = detectPatterns("mypw1992x");
    expect(r.some((p) => p.type === "date")).toBe(true);
  });
  test("clean 20-char password has no patterns", () => {
    const r = detectPatterns("Q3v#7mZ!9xP@kL$5nR&Y");
    expect(r).toHaveLength(0);
  });
});

describe("analyzePassword", () => {
  test('very weak: "123456"', () => {
    const r = analyzePassword("123456");
    expect(r.score).toBe(0);
    expect(r.label).toBe("Very Weak");
    expect(r.feedback.length).toBeGreaterThan(0);
  });
  test("weak: 8 chars all lowercase", () => {
    const r = analyzePassword("abcdefgh");
    expect(r.score).toBeLessThanOrEqual(2);
  });
  test("all-lowercase dictionary-word concatenation is weak (entropy only)", () => {
    // Concatenated English words from a small pool + no symbols caps the
    // entropy around poolSize=26 / 13 chars ~ 61 bits -> score 2 or below.
    // We assert the score is not maxed out, not that the word list matches:
    // short slurs like "ass" or "nigga" must NOT match as dictionary words,
    // because that would false-positive almost every random lowercase string.
    const r = analyzePassword("bitchassnigga");
    expect(r.score).toBeLessThanOrEqual(2);
    expect(r.label).not.toBe("Very Strong");
    expect(r.poolSize).toBeLessThanOrEqual(26);
  });
  test("strong: long random-looking", () => {
    const r = analyzePassword("Q3v#7mZ!9xP@kL$5nR&Yd8Wq2");
    expect(r.score).toBeGreaterThanOrEqual(3);
    expect(r.poolSize).toBeGreaterThan(50);
  });
  test("crackTime estimates exist for non-empty input", () => {
    const r = analyzePassword("Abcd1234!@");
    expect(r.crackTimes.length).toBe(5);
  });
  test("crackTime human strings are populated", () => {
    const r = analyzePassword("Abcd1234!@");
    for (const ct of r.crackTimes) {
      expect(ct.averageHuman.length).toBeGreaterThan(0);
      expect(ct.worstHuman.length).toBeGreaterThan(0);
    }
  });
});

describe("naiveEntropyBits", () => {
  test("4 chars from lowercase: ~18.8 bits", () => {
    const r = naiveEntropyBits("abcd");
    expect(r.poolSize).toBe(26);
    expect(r.bits.toFixed(2)).toBe("18.80");
  });
});

describe("generateUuid", () => {
  test("produces a valid v4 UUID", () => {
    const u = generateUuid();
    expect(u).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  test("uppercase option", () => {
    const u = generateUuid({ case: "upper" });
    expect(u).toBe(u.toUpperCase());
    expect(u).toMatch(/^[0-9A-F-]+$/);
  });
  test("generateUuids count", () => {
    const xs = generateUuids(5);
    expect(xs).toHaveLength(5);
    const set = new Set(xs);
    expect(set.size).toBe(5);
  });
  test("generateUuids validates count", () => {
    expect(() => generateUuids(0)).toThrow();
    expect(() => generateUuids(2000)).toThrow();
  });
});
