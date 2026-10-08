<template>
  <div>
    <p class="fr-text--bold fr-text--sm">
      {{ AgrementDisplayInput.AgrementBilanAnnuelInput.typeHandicap.label }}
    </p>
    <DsfrTags :tags="typeDeficiencesTags" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  typeDeficiences: { type: Array, default: () => [] },
});

const options =
  AgrementDisplayInput.AgrementBilanAnnuelInput.typeHandicap.options ?? {};

const typeDeficiencesTags = computed(() =>
  props.typeDeficiences.map((value) => ({
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
