<script setup lang="ts">
import {
  generateCuid,
  generateKsuid,
  generateNanoId,
  generateUlid,
  generateUuids,
  type UuidVersion,
} from "@germondai/security";
import { computed, ref } from "vue";
import CliCommandBox from "@/components/shared/CliCommandBox.vue";
import CopyButton from "@/components/shared/CopyButton.vue";

type Kind = "uuid" | "cuid" | "nanoid" | "ulid" | "ksuid";

const kind = ref<Kind>("uuid");
const version = ref<UuidVersion>("v4");
const count = ref(8);
const upper = ref(false);
const name = ref("gsec");
const size = ref(21);
const seed = ref(0);

const kinds: { value: Kind; label: string; hint: string }[] = [
  { value: "uuid", label: "UUID", hint: "RFC 4122 (v1–v7)" },
  { value: "cuid", label: "CUID", hint: "24-char URL-safe, prefix `c`" },
  { value: "nanoid", label: "Nano", hint: "Nano ID — customizable length" },
  { value: "ulid", label: "ULID", hint: "26-char, time-sortable" },
  { value: "ksuid", label: "KSUID", hint: "27-char Base62, time-sortable" },
];
const versions: readonly UuidVersion[] = ["v1", "v3", "v4", "v5", "v7"];

const ids = computed<string[]>(() => {
  void seed.value;
  try {
    if (kind.value === "cuid") return Array.from({ length: count.value }, () => generateCuid(24));
    if (kind.value === "nanoid")
      return Array.from({ length: count.value }, () => generateNanoId(size.value));
    if (kind.value === "ulid") return Array.from({ length: count.value }, () => generateUlid());
    if (kind.value === "ksuid") return Array.from({ length: count.value }, () => generateKsuid());
    return generateUuids(count.value, {
      version: version.value,
      case: upper.value ? "upper" : "lower",
    });
  } catch {
    return [];
  }
});

const all = computed(() => ids.value.join("\n"));
function regenerate() {
  seed.value++;
}

const cli = computed(() => {
  if (kind.value !== "uuid")
    return (
      `bun cli gen uuid --kind ${kind.value} --count ${count.value}` +
      (kind.value === "nanoid" ? ` --size ${size.value}` : "")
    );
  const parts = [
    "bun cli gen uuid",
    `--kind uuid`,
    `--version ${version.value}`,
    `--count ${count.value}`,
  ];
  if (upper.value) parts.push("--upper");
  if ((version.value === "v3" || version.value === "v5") && name.value)
    parts.push(`--name "${name.value}"`);
  return parts.join(" ");
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
        <p class="field-label">Kind</p>
        <div
          class="tab-bar"
          :style="{ 'grid-template-columns': `repeat(${kinds.length}, minmax(0, 1fr))` }"
        >
          <button
            v-for="k in kinds"
            :key="k.value"
            type="button"
            @click="kind = k.value"
            :title="k.hint"
            :aria-pressed="kind === k.value"
            :class="{ 'is-active': kind === k.value }"
          >
            {{ k.label }}
          </button>
        </div>
      </div>

      <!-- UUID version picker (only when kind = uuid) -->
      <div v-if="kind === 'uuid'">
        <p class="field-label">Version</p>
        <div
          class="tab-bar"
          :style="{ 'grid-template-columns': `repeat(${versions.length}, minmax(0, 1fr))` }"
        >
          <button
            v-for="v in versions"
            :key="v"
            type="button"
            @click="version = v"
            :title="v === 'v1' ? 'timestamp + MAC (deprecated)' : v === 'v3' ? 'MD5 namespace hash' : v === 'v4' ? 'random' : v === 'v5' ? 'SHA-1 namespace hash' : 'time-ordered'"
            :aria-pressed="version === v"
            :class="{ 'is-active': version === v }"
          >
            {{ v.toUpperCase() }}
          </button>
        </div>
        <label
          v-if="version === 'v4' || version === 'v7'"
          class="mt-3 flex items-center gap-3 cursor-pointer text-[0.92rem] select-none"
        >
          <span class="switch" :class="{ 'is-on': upper }"
            ><input type="checkbox" v-model="upper" class="sr-only">
            <span class="switch-knob"></span></span
          >
          <span>Uppercase output</span>
        </label>
      </div>

      <!-- Nano ID length -->
      <div v-if="kind === 'nanoid'">
        <label for="uuid-nanoid-size" class="field-label"
          >Length: <span class="text-[rgb(var(--accent))]">{{ size }}</span></label
        >
        <input
          id="uuid-nanoid-size"
          type="range"
          :min="1"
          :max="64"
          :step="1"
          v-model.number="size"
          class="w-full"
        >
      </div>

      <!-- v3/v5 name input -->
      <div v-if="kind === 'uuid' && (version === 'v3' || version === 'v5')">
        <label for="uuid-name" class="field-label">Name (namespace hashed with SHA-1/MD5)</label>
        <input
          id="uuid-name"
          type="text"
          v-model="name"
          placeholder="example.com"
          class="font-mono"
        >
      </div>

      <!-- Count slider -->
      <div>
        <label for="uuid-count" class="field-label"
          >Count: <span class="text-[rgb(var(--accent))]">{{ count }}</span></label
        >
        <input
          id="uuid-count"
          type="range"
          :min="1"
          :max="50"
          :step="1"
          v-model.number="count"
          class="w-full"
        >
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-2">
        <button type="button" class="btn" @click="regenerate">↻ Regenerate</button>
        <CopyButton :value="all" />
      </div>

      <!-- Output list -->
      <div
        class="grid gap-1.5 max-h-96 overflow-y-auto rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--bg))] p-2"
      >
        <div v-for="(u, idx) in ids" :key="idx" class="flex items-stretch gap-2">
          <code
            class="flex-1 break-all rounded px-3 py-1.5 font-mono text-[0.82rem] hover:bg-[rgb(var(--bg-soft))]"
            >{{ u }}</code
          >
          <CopyButton :value="u" />
        </div>
      </div>

      <div class="space-y-1 border-t border-[rgb(var(--border))] pt-4">
        <p class="field-label">Equivalent CLI command</p>
        <CliCommandBox :command="cli" />
      </div>
    </div>
  </article>
</template>
