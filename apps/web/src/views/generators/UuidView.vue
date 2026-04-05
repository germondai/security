<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  generateUuids, generateCuid, generateNanoId, generateUlid, generateKsuid,
  type UuidVersion,
} from '@germondai/security';
import CopyButton from '@/components/shared/CopyButton.vue';
import CliCommandBox from '@/components/shared/CliCommandBox.vue';

type Kind = 'uuid' | 'cuid' | 'nanoid' | 'ulid' | 'ksuid';

const kind = ref<Kind>('uuid');
const version = ref<UuidVersion>('v4');
const count = ref(8);
const upper = ref(false);
const name = ref('gsec');
const size = ref(21);
const seed = ref(0);

const kinds: { value: Kind; label: string; hint: string }[] = [
  { value: 'uuid',   label: 'UUID',     hint: 'RFC 4122 (v1–v7)' },
  { value: 'cuid',   label: 'CUID',     hint: '24-char URL-safe, prefix `c`' },
  { value: 'nanoid', label: 'Nano ID',  hint: 'customizable length & alphabet' },
  { value: 'ulid',   label: 'ULID',     hint: '26-char, time-sortable' },
  { value: 'ksuid',  label: 'KSUID',    hint: '27-char Base62, time-sortable' },
];
const versions: readonly UuidVersion[] = ['v1', 'v3', 'v4', 'v5', 'v7'];

const ids = computed<string[]>(() => {
  void seed.value;
  try {
    if (kind.value === 'cuid')       return Array.from({ length: count.value }, () => generateCuid(24));
    if (kind.value === 'nanoid')     return Array.from({ length: count.value }, () => generateNanoId(size.value));
    if (kind.value === 'ulid')       return Array.from({ length: count.value }, () => generateUlid());
    if (kind.value === 'ksuid')      return Array.from({ length: count.value }, () => generateKsuid());
    return generateUuids(count.value, { version: version.value, case: upper.value ? 'upper' : 'lower' });
  } catch { return []; }
});

const all = computed(() => ids.value.join('\n'));
function regenerate() { seed.value++; }

const cli = computed(() => {
  if (kind.value !== 'uuid') return `bun cli gen uuid --kind ${kind.value} --count ${count.value}` + (kind.value === 'nanoid' ? ` --size ${size.value}` : '');
  const parts = ['bun cli gen uuid', `--kind uuid`, `--version ${version.value}`, `--count ${count.value}`];
  if (upper.value) parts.push('--upper');
  if ((version.value === 'v3' || version.value === 'v5') && name.value) parts.push(`--name "${name.value}"`);
  return parts.join(' ');
});
</script>

<template>
  <article class="space-y-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold">▸ ID generator</h1>
      <p class="text-[0.9rem] text-[rgb(var(--fg-muted))]">
        UUID (v1–v7), CUID, Nano ID, ULID, KSUID. All CSPRNG.
      </p>
    </header>

    <div class="card p-5 space-y-5">
      <!-- Kind picker -->
      <div>
        <label class="field-label">Kind</label>
        <div class="tab-bar" :style="{ 'grid-template-columns': `repeat(${kinds.length}, minmax(0, 1fr))` }">
          <button v-for="k in kinds" :key="k.value"
            type="button" @click="kind = k.value"
            :title="k.hint"
            :aria-pressed="kind === k.value"
            :class="{ 'is-active': kind === k.value }">
            {{ k.label }}
          </button>
        </div>
      </div>

      <!-- UUID version picker (only when kind = uuid) -->
      <div v-if="kind === 'uuid'">
        <label class="field-label">Version</label>
        <div class="tab-bar" :style="{ 'grid-template-columns': `repeat(${versions.length}, minmax(0, 1fr))` }">
          <button v-for="v in versions" :key="v"
            type="button" @click="version = v"
            :title="v === 'v1' ? 'timestamp + MAC (deprecated)' : v === 'v3' ? 'MD5 namespace hash' : v === 'v4' ? 'random' : v === 'v5' ? 'SHA-1 namespace hash' : 'time-ordered'"
            :aria-pressed="version === v"
            :class="{ 'is-active': version === v }">
            {{ v.toUpperCase() }}
          </button>
        </div>
        <label v-if="version === 'v4' || version === 'v7'" class="mt-3 flex items-center gap-2 text-[0.88rem]">
          <input type="checkbox" v-model="upper" /> Uppercase output
        </label>
      </div>

      <!-- Nano ID length -->
      <div v-if="kind === 'nanoid'">
        <label class="field-label">Length: <span class="text-[rgb(var(--accent))]">{{ size }}</span></label>
        <input type="range" :min="1" :max="64" :step="1" v-model.number="size" class="w-full max-w-xs" />
      </div>

      <!-- v3/v5 name input -->
      <div v-if="kind === 'uuid' && (version === 'v3' || version === 'v5')">
        <label class="field-label">Name (namespace hashed with SHA-1/MD5)</label>
        <input type="text" v-model="name" placeholder="example.com" class="font-mono" />
      </div>

      <!-- Count slider -->
      <div>
        <label class="field-label">Count: <span class="text-[rgb(var(--accent))]">{{ count }}</span></label>
        <input type="range" :min="1" :max="50" :step="1" v-model.number="count" class="w-full max-w-xs" />
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <button class="btn" @click="regenerate">↻ Regenerate</button>
        <CopyButton :value="all" />
      </div>

      <!-- Output list -->
      <div class="grid gap-1.5 max-h-96 overflow-y-auto rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2">
        <div v-for="(u, idx) in ids" :key="idx" class="flex items-stretch gap-2">
          <code class="flex-1 break-all rounded px-3 py-1.5 font-mono text-[0.82rem] hover:bg-[rgb(var(--bg-soft))]">{{ u }}</code>
          <CopyButton :value="u" />
        </div>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <label class="field-label">Equivalent CLI command</label>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
