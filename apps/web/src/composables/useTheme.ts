import { ref, readonly, watchEffect } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'gsec-theme';
const theme = ref<Theme>('system');
const resolved = ref<'light' | 'dark'>('light');
let initialized = false;

function applyTheme(t: Theme): void {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  if (t === 'system') {
    html.removeAttribute('data-theme');
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    resolved.value = mql.matches ? 'dark' : 'light';
  } else {
    html.setAttribute('data-theme', t);
    resolved.value = t;
  }
}

function readStored(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' || v === 'system' ? v : 'system';
  } catch {
    return 'system';
  }
}

/** Call once at app boot. Safe to call from main.ts (no component context). */
export function initTheme(): void {
  if (initialized) return;
  initialized = true;
  theme.value = readStored();
  applyTheme(theme.value);
  watchEffect(() => applyTheme(theme.value));
  if (typeof window !== 'undefined') {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', () => {
      if (theme.value === 'system') applyTheme('system');
    });
  }
}

export function useTheme() {
  function set(next: Theme) {
    theme.value = next;
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
  }
  function cycle() {
    const order: Theme[] = ['system', 'light', 'dark'];
    const idx = order.indexOf(theme.value);
    const next = order[(idx + 1) % order.length] as Theme;
    set(next);
  }
  return { theme: readonly(theme), resolved: readonly(resolved), set, cycle };
}
