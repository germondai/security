import { secureRandomInt } from "../internal/random.js";

export function rollDice(min = 1, max = 6): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError("min/max must be integers and min <= max");
  }
  return secureRandomInt(min, max + 1);
}

export function rollDiceMany(count: number, sides = 6): number[] {
  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    throw new RangeError("count must be in [1, 10000]");
  }
  const out: number[] = new Array(count);
  for (let i = 0; i < count; i++) out[i] = rollDice(1, sides);
  return out;
}

export function randomInt(min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
    throw new RangeError("min/max must be integers and min <= max");
  }
  return secureRandomInt(min, max + 1);
}
