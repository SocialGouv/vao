<template>
  <a
    :href="safeUrl"
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

const log = logger("UtilsDownloadFile");

const ALLOWED_PROTOCOLS = ["https:", "http:"];

const safeUrl = computed<string | undefined>(() => {
  try {
    const parsed = new URL(props.url);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      log.w(
        `[UtilsDownloadFile] Blocked URL with protocol: ${parsed.protocol}`,
      );
      return undefined;
    }
    return parsed.toString();
  } catch {
    log.w(`[UtilsDownloadFile] Invalid URL: ${props.url}`);
    return undefined;
  }
});

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
