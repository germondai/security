<script setup lang="ts">
import { ref, computed } from 'vue';
import { analyzePassword, generatePassword, type StrengthResult } from '@germondai/security';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

const input = ref('');
const EXAMPLE = 'MyDog\\\'sNameIsRex!2024';
const generated = ref('');

const result = computed<StrengthResult | null>(() => {
  if (input.value.length === 0) return null;
  return analyzePassword(input.value);
});

const scoreColor = (s: 0 | 1 | 2 | 3 | 4): string => {
  return ['rgb(var(--danger))', 'rgb(var(--danger))', 'rgb(var(--accent-2))', 'rgb(var(--accent))', 'rgb(var(--ok))'][s] ?? '';
};

const cli = computed(() => `bun cli analyze --input "${input.value.replace(/"/g, '\\"').slice(0, 60) || '…'}"`);

function tryExample() { input.value = EXAMPLE; }

function generateStrong() {
  // 24 chars, all classes, requireEach, exclude ambiguous
  generated.value = generatePassword({
    length: 24, requireEach: true, excludeAmbiguous: true,
  });
  input.value = generated.value;
}
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-2 flex items-start justify-between gap-4 flex-wrap">
      <div class="space-y-1">
        <h1 class="text-2xl font-bold">▸ Password strength analyzer</h1>
        <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
          Type or paste a candidate. Dictionary + patterns + entropy + crack time, all local.
        </p>
      </div>
      <button class="btn btn-accent" @click="generateStrong">⚡ Generate strong password</button>
    </header>

    <div class="card p-5 space-y-4">
      <div>
        <label class="field-label">Candidate password</label>
        <input type="text" v-model="input" placeholder="type something to analyze…"
          autocomplete="off" spellcheck="false" class="font-mono" />
        <div class="mt-2 flex items-center justify-between text-[0.78rem] text-[rgb(var(--fg-muted))]">
          <span>Try: <button class="underline hover:text-[rgb(var(--accent))]" @click="tryExample" type="button">{{ EXAMPLE }}</button></span>
          <span v-if="input.length > 0">{{ input.length }} chars</span>
        </div>
      </div>

      <div v-if="result" class="space-y-4">
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-[0.85rem]">
            <span class="text-[rgb(var(--fg-muted))]">Score</span>
            <span class="font-bold" :style="{ color: scoreColor(result.score) }">{{ result.label }} ({{ result.score }}/4)</span>
          </div>
          <div class="flex gap-1.5">
            <div v-for="i in 5" :key="i" class="h-2 flex-1 rounded-full border"
              :style="{ background: i <= result.score + 1 ? scoreColor(result.score) : 'transparent', borderColor: i <= result.score + 1 ? scoreColor(result.score) : 'rgb(var(--border))' }" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 text-[0.85rem] sm:grid-cols-4">
          <div><div class="text-[0.7rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Length</div><div class="text-lg font-bold">{{ result.length }}</div></div>
          <div><div class="text-[0.7rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Unique chars</div><div class="text-lg font-bold">{{ result.uniqueChars }}</div></div>
          <div><div class="text-[0.7rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Naive bits</div><div class="text-lg font-bold">{{ result.naiveBits.toFixed(1) }}</div></div>
          <div><div class="text-[0.7rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">Effective bits</div><div class="text-lg font-bold" :style="{ color: scoreColor(result.score) }">{{ result.effectiveBits.toFixed(1) }}</div></div>
        </div>

        <div>
          <h3 class="field-label">Time to crack (per scenario)</h3>
          <div class="overflow-hidden rounded-md border">
            <table class="w-full text-[0.83rem]">
              <thead class="bg-[rgb(var(--bg))] text-[0.7rem] uppercase tracking-wider text-[rgb(var(--fg-muted))]">
                <tr><th class="px-3 py-2 text-left">Scenario</th><th class="px-3 py-2 text-right">Guesses/s</th><th class="px-3 py-2 text-right">Average</th><th class="px-3 py-2 text-right">Worst case</th></tr>
              </thead>
              <tbody>
                <tr v-for="ct in result.crackTimes" :key="ct.scenario" class="border-t">
                  <td class="px-3 py-1.5 font-mono text-[0.8rem]">{{ ct.scenario }}</td>
                  <td class="px-3 py-1.5 text-right tabular-nums text-[rgb(var(--fg-muted))]">{{ ct.guessesPerSecond.toExponential(0) }}</td>
                  <td class="px-3 py-1.5 text-right font-semibold">{{ ct.averageHuman }}</td>
                  <td class="px-3 py-1.5 text-right text-[rgb(var(--fg-muted))]">{{ ct.worstHuman }}</td>
                </tr>
              </tbody>
            </table>
            <p class="text-[0.7rem] text-[rgb(var(--fg-muted))] px-3 py-2">
              Values beyond 10¹⁵ seconds use scientific notation; "forever" means longer than the heat death of the universe.
            </p>
          </div>
        </div>

        <div v-if="result.patterns.length > 0">
          <h3 class="field-label">Patterns detected</h3>
          <ul class="flex flex-wrap gap-2 text-[0.8rem]">
            <li v-for="(p, i) in result.patterns" :key="i" class="pill pill-danger">
              <span class="font-mono">{{ p.match }}</span>
              <span class="text-[rgb(var(--fg-muted))]">·</span><span>{{ p.type }}</span>
            </li>
          </ul>
        </div>

        <div v-if="result.feedback.length > 0">
          <h3 class="field-label">Suggestions</h3>
          <ul class="space-y-1 text-[0.85rem] text-[rgb(var(--fg-muted))]">
            <li v-for="(f, i) in result.feedback" :key="i">— {{ f }}</li>
          </ul>
        </div>

        <div class="space-y-1 border-t pt-4">
          <label class="field-label">Equivalent CLI command</label>
          <CliCommandBox :command="cli" />
        </div>
      </div>

      <div v-else class="space-y-3 border-t pt-4 text-[0.85rem] text-[rgb(var(--fg-muted))]">
        <p class="text-[0.95rem] font-semibold text-[rgb(var(--fg))]">Try one of these (or click <strong>⚡ Generate strong password</strong> above):</p>
        <ul class="space-y-1.5 font-mono text-[0.8rem]">
          <li><button @click="input = 'password'" class="underline hover:text-[rgb(var(--danger))]">password</button> — <span class="text-[rgb(var(--danger))]">the classic</span></li>
          <li><button @click="input = 'P@ssw0rd!'" class="underline hover:text-[rgb(var(--danger))]">P@ssw0rd!</button> — <span class="text-[rgb(var(--danger))]">looks strong, is not</span></li>
          <li><button @click="input = 'qwerty12345'" class="underline hover:text-[rgb(var(--danger))]">qwerty12345</button> — <span class="text-[rgb(var(--danger))]">keyboard walk + sequence</span></li>
          <li><button @click="input = 'letmein'" class="underline hover:text-[rgb(var(--danger))]">letmein</button> — <span class="text-[rgb(var(--danger))]">common dictionary word</span></li>
          <li><button @click="input = 'Q3v#7mZ!9xP@kL$5nR&Yd8Wq2'" class="underline hover:text-[rgb(var(--ok))]">Q3v#7mZ!9xP@kL$5nR&Yd8Wq2</button> — <span class="text-[rgb(var(--ok))]">this should be strong</span></li>
        </ul>
      </div>
    </div>
  </article>
</template>
