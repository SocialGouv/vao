<template>
  <div>
    <p class="fr-text--bold fr-text--sm">
      {{ AgrementDisplayInput.AgrementBilanAnnuelInput.trancheAge.label }}
    </p>
    <DsfrTags :tags="trancheAgeTags" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  trancheAge: { type: Array, default: () => [] },
});

const options =
  AgrementDisplayInput.AgrementBilanAnnuelInput.trancheAge.options ?? {};

const trancheAgeTags = computed(() =>
  props.trancheAge.map((value) => ({
    label: options[value as keyof typeof options] ?? value,
    class: "agrement-tag",
  })),
);
</script>

<style scoped>
:deep(.fr-tag) {
  background-color: #adadf9;
  color: #000091;
}
</style>
