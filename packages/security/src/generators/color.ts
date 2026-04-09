import { secureRandomBytes } from '../internal/random.js';

export interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
}

export function randomColor(): Color {
  const b = secureRandomBytes(3);
  return formatColor(b[0] ?? 0, b[1] ?? 0, b[2] ?? 0);
}

export function randomPleasantColor(satRange: [number, number] = [40, 80], lightRange: [number, number] = [40, 70]): Color {
  const b = secureRandomBytes(3);
  const h = ((b[0] ?? 0) * 360) / 256;
  const s = satRange[0] + ((b[1] ?? 0) / 256) * (satRange[1] - satRange[0]);
  const l = lightRange[0] + ((b[2] ?? 0) / 256) * (lightRange[1] - lightRange[0]);
  const { r, g, b: bl } = hslToRgb(h, s, l);
  return formatColor(r, g, bl);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60)       [r1, g1, b1] = [c, x, 0];
  else if (h < 120) [r1, g1, b1] = [x, c, 0];
  else if (h < 180) [r1, g1, b1] = [0, c, x];
  else if (h < 240) [r1, g1, b1] = [0, x, c];
  else if (h < 300) [r1, g1, b1] = [x, 0, c];
  else              [r1, g1, b1] = [c, 0, x];
  return { r: Math.round((r1 + m) * 255), g: Math.round((g1 + m) * 255), b: Math.round((b1 + m) * 255) };
}

function formatColor(r: number, g: number, b: number): Color {
  return {
    hex: '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0'),
    rgb: { r, g, b },
    hsl: rgbToHsl(r, g, b),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h *= 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
