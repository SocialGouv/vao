<template>
  <template v-if="displayValue">{{ displayValue }}</template>
  <span v-else>
    <span aria-hidden="true">—</span>
    <span class="fr-sr-only">Non renseigné</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ value: unknown }>();

const displayValue = computed(() => {
  const { value } = props;
  if (value === null || value === undefined) return null;
  if (typeof value === "string" && value === "") return null;
  if (Array.isArray(value) && value.length === 0) return null;
  return String(value);
});
</script>
