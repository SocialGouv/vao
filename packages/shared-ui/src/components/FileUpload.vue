<template>
  <div class="fr-input-group" style="margin-bottom: 2rem">
    <div v-if="!props.modifiable">
      <dl class="fr-text--sm fr-pl-0">
        <dt v-if="props.label" class="fr-text--bold">{{ props.label }}:</dt>
        <dd>
          <a
            v-if="fileLink"
            class="fr-link fr-link--sm fr-icon-eye-line fr-link--icon-right"
            :href="fileLink.href"
            :download="fileLink.name"
            :aria-label="`Télécharger le fichier ${fileLink.name}`"
            :title="`Télécharger le fichier ${fileLink.name}`"
          >
            {{ fileLink.name }}
          </a>
          <span
            v-else-if="!props.optional"
            class="fr-mb-4v fr-text--sm fr-error-text"
          >
            À compléter
          </span>
          <span v-else class="fr-mb-4v fr-icon-file-line fr-text--sm">
            Aucun fichier téléversé
          </span>
          <span v-if="props.hint" class="fr-hint-text">
            {{ props.hint }}
          </span>
          <span v-if="props.errorMessage" class="fr-error-text fr-text--sm">
            {{ props.errorMessage }}
          </span>
        </dd>
      </dl>
    </div>
    <div v-else>
      <DsfrFileUpload
        v-bind="$attrs"
        :label="props.label"
        :hint="props.hint"
        :error="props.errorMessage"
        :disabled="isDisabled"
        @change="changeFile"
      />
      <a
        v-if="fileLink"
        class="fr-link fr-link--sm fr-icon-download-line fr-link--icon-right fr-mt-4v file-download-link"
        :href="fileLink.href"
        :download="fileLink.name"
        :aria-label="`Télécharger le fichier ${fileLink.name}`"
        :title="`Télécharger le fichier ${fileLink.name}`"
      >
        {{ fileLink.name }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DsfrFileUpload } from "@gouvminint/vue-dsfr";
import { computed } from "vue";
defineOptions({ inheritAttrs: false });
const props = defineProps({
  modifiable: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
  cdnUrl: { type: String, required: true },
  isDisabled: { type: Boolean, default: false },
  label: { type: String, default: "" },
  hint: { type: String, default: "" },
  optional: { type: Boolean, default: true },
});

const file = defineModel({ type: Object });
const fileLink = computed(() => {
  const name = file.value?.name;
  if (!name || !file.value?.uuid) return null;
  return {
    name,
    href: `${props.cdnUrl}${props.cdnUrl?.endsWith("/") ? "" : "/"}${file.value.uuid}`,
  };
});

function changeFile(fileList: FileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>

<style scoped>
.file-download-link {
  display: inline-block;
}
</style>
