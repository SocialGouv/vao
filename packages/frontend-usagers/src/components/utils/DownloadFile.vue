<template>
  <a
    :href="props.url"
    :download="props.filename"
    class="fr-link fr-link--download fr-icon-download-fill fr-link--icon-left"
  >
    {{ props.label }}
    <span v-if="downloadDetail" class="fr-link__detail">{{
      downloadDetail
    }}</span>
  </a>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    url: string;
    filename: string;
    label?: string;
    fileSize?: string;
  }>(),
  {
    label: "Download PDF",
    fileSize: undefined,
  },
);

const downloadDetail = computed<string | undefined>(() => {
  if (!props.fileSize) {
    return undefined;
  }

  const extension = props.filename.split(".").pop()?.toUpperCase();

  if (!extension) {
    return props.fileSize;
  }

  return `${extension} – ${props.fileSize}`;
});
</script>
