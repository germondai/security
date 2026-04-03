import { computed, ref } from 'vue';
import { generatePassword, type PasswordOptions } from '@germondai/security';

export function usePasswordGenerator() {
  const length = ref(20);
  const lower = ref(true);
  const upper = ref(true);
  const digits = ref(true);
  const symbols = ref(true);
  const excludeAmbiguous = ref(false);
  const requireEach = ref(false);
  const error = ref<string | null>(null);

  const options = computed<PasswordOptions>(() => ({
    length: length.value,
    lower: lower.value,
    upper: upper.value,
    digits: digits.value,
    symbols: symbols.value,
    excludeAmbiguous: excludeAmbiguous.value,
    requireEach: requireEach.value,
  }));

  const output = computed<string>(() => {
    try {
      error.value = null;
      return generatePassword(options.value);
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      return '';
    }
  });

  const regenerate = (): void => {
    // Force a recompute by toggling a dep
    void options.value;
  };

  return {
    length,
    lower,
    upper,
    digits,
    symbols,
    excludeAmbiguous,
    requireEach,
    output,
    error,
    regenerate,
  };
}
