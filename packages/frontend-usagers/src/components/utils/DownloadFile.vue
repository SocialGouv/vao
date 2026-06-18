<template>
  <a
    :href="safeUrl"
    :download="props.filename"
    class="fr-link fr-link--download fr-icon-download-fill fr-link--icon-left"
    :aria-disabled="isBlocked"
    :tabindex="isBlocked ? -1 : undefined"
    @click="onLinkClick"
  >
    {{ props.label }}
    <span v-if="downloadDetail" class="fr-link__detail">
      {{ downloadDetail }}
    </span>
  </a>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface DownloadFileProps {
  url: string;
  filename: string;
  label?: string;
  fileSize?: string;
}

const props = withDefaults(defineProps<DownloadFileProps>(), {
  label: "Download PDF",
  fileSize: undefined,
});

const BLOCKED_URL = "about:blank";
const ALLOWED_PROTOCOLS = ["http:", "https:"] as const;

type AllowedProtocol = (typeof ALLOWED_PROTOCOLS)[number];

const isAllowedProtocol = (protocol: string): protocol is AllowedProtocol => {
  return (ALLOWED_PROTOCOLS as readonly string[]).includes(protocol);
};

const isRelativePath = (value: string): boolean => {
  return /^(\/(?!\/)|\.\/|\.\.\/)/.test(value);
};

const sanitizeUrl = (value: string): string => {
  const url = value.trim();

  if (isRelativePath(url)) {
    return url;
  }

  try {
    const parsed = new URL(url);

    if (!isAllowedProtocol(parsed.protocol)) {
      return BLOCKED_URL;
    }

    return parsed.toString();
  } catch {
    return BLOCKED_URL;
  }
};

const safeUrl = computed<string>(() => {
  return sanitizeUrl(props.url);
});

const isBlocked = computed<boolean>(() => {
  return safeUrl.value === BLOCKED_URL;
});

const onLinkClick = (event: MouseEvent): void => {
  if (isBlocked.value) {
    event.preventDefault();
  }
};

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
