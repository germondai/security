/**
 * Minimal input helper. For the v0.1 password slice the wizard handles all
 * interactive input via @clack/prompts; this stub exists so future commands
 * (file-based hash, stdin cipher, etc.) can reuse a single helper.
 *
 * Reads a string from (in order):
 *   1. the explicit `value` argument
 *   2. the file at `value` if it is a path that exists
 *   3. stdin if it is a pipe (not a TTY)
 */
import { existsSync, readFileSync } from 'node:fs';
import { stdin } from 'node:process';

export function readInput(value?: string): string {
  if (value === undefined) {
    if (!stdin.isTTY) {
      return readFileSync(0, 'utf8');
    }
    throw new Error('No input provided. Pass --input "<value>" or pipe via stdin.');
  }
  if (existsSync(value)) {
    return readFileSync(value, 'utf8');
  }
  return value;
}
