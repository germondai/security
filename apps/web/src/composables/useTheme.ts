import { readonly, ref, watchEffect } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "gsec-theme";

function systemPreference(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const theme = ref<Theme>(systemPreference());
let initialized = false;

function applyTheme(t: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", t);
}

function readStored(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** Call once at app boot. Safe to call from main.ts (no component context). */
export function initTheme(): void {
  if (initialized) return;
  initialized = true;
  theme.value = readStored() ?? systemPreference();
  applyTheme(theme.value);
  watchEffect(() => applyTheme(theme.value));
  if (typeof window !== "undefined") {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (readStored() === null) theme.value = e.matches ? "dark" : "light";
    });
  }
}

export function useTheme() {
  function set(next: Theme) {
    theme.value = next;
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }
  function toggle() {
    set(theme.value === "dark" ? "light" : "dark");
  }
  return { theme: readonly(theme), set, toggle };
}
