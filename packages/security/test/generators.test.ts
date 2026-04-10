import { describe, expect, test } from 'bun:test';
import { generatePassword } from '../src/generators/password.js';

describe('generatePassword', () => {
  test('honors length', () => {
    for (const len of [1, 4, 16, 64, 256]) {
      expect(generatePassword({ length: len }).length).toBe(len);
    }
  });

  test('uses requested classes only', () => {
    expect(
      /^[a-z]+$/.test(
        generatePassword({ length: 32, lower: true, upper: false, digits: false, symbols: false }),
      ),
    ).toBe(true);
    expect(
      /^[0-9]+$/.test(
        generatePassword({ length: 32, lower: false, upper: false, digits: true, symbols: false }),
      ),
    ).toBe(true);
    expect(
      /^[A-Za-z0-9]+$/.test(
        generatePassword({ length: 32, lower: true, upper: true, digits: true, symbols: false }),
      ),
    ).toBe(true);
  });

  test('excludeAmbiguous removes 0Oo1lI|`\'"', () => {
    const p = generatePassword({ length: 200, excludeAmbiguous: true });
    expect(p).not.toMatch(/[0Oo1lI|`'"]/);
  });

  test('requireEach guarantees each class', () => {
    for (let i = 0; i < 25; i++) {
      const p = generatePassword({ length: 24, requireEach: true });
      expect(/[a-z]/.test(p)).toBe(true);
      expect(/[A-Z]/.test(p)).toBe(true);
      expect(/[0-9]/.test(p)).toBe(true);
      expect(/[!@#$%^&*()\-_=+\[\]{};:,.<>?\/~]/.test(p)).toBe(true);
    }
  });

  test('throws on empty pool', () => {
    expect(() =>
      generatePassword({ length: 8, lower: false, upper: false, digits: false, symbols: false }),
    ).toThrow();
  });

  test('throws when requireEach cannot be satisfied', () => {
    expect(() => generatePassword({ length: 2, requireEach: true })).toThrow();
  });

  test('throws on invalid length', () => {
    expect(() => generatePassword({ length: 0 })).toThrow();
    expect(() => generatePassword({ length: -1 })).toThrow();
    expect(() => generatePassword({ length: 1.5 })).toThrow();
    expect(() => generatePassword({ length: 2000 })).toThrow();
  });

  test('output is non-deterministic', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(generatePassword({ length: 24 }));
    expect(seen.size).toBeGreaterThan(40);
  });
});
