<template>
  <div class="fr-input-group" style="margin-bottom: 2rem">
    <div v-if="!props.modifiable">
      <dl class="fr-text--sm fr-pl-0">
        <dt v-if="props.label">{{ props.label }}</dt>
        <dd>
          <DsfrTable
            v-if="rows.length > 0"
            title="Fichier(s) téléversé(s)"
            :headers="headers"
            :rows="rows"
            :no-caption="true"
          />
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
      <DsfrTable
        v-if="rows.length > 0"
        title="Fichier téléversé"
        :label="props.label || undefined"
        :headers="headers"
        :rows="rows"
        :no-caption="true"
      />
      <DsfrFileUpload
        v-bind="$attrs"
        :label="props.label"
        :hint="props.hint"
        :error="props.errorMessage"
        :disabled="isDisabled"
        @change="changeFile"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DsfrFileUpload } from "@gouvminint/vue-dsfr";
import { computed } from "vue";
import dayjs from "dayjs";
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

const headers = [
  "Nom du fichier",
  "Type de fichier",
  "Date de création",
  "Téléchargement",
];
const file = defineModel({ type: Object });
const rows = computed(() => {
  if (file.value?.name) {
    const name = file.value.name;
    const extension = name?.split(".").pop()?.toLowerCase() || "-";
    const type = extension;
    const createdAt = file.value.createdAt
      ? dayjs(file.value.createdAt).format("YYYY-MM-DD HH:mm")
      : "";
    const download = file.value.uuid
      ? {
          component: "a",
          innerHTML:
            '<span class="fr-icon-file-download-fill" aria-hidden="true"></span>',
          href: `${props.cdnUrl}${props.cdnUrl?.endsWith("/") ? "" : "/"}${file.value.uuid}`,
          download: true,
          "aria-label": `Télécharger le fichier ${file.value.name}`,
          title: `Télécharger le fichier ${file.value.name}`,
          style: "background: none;",
        }
      : "-";
    return [[name, type, createdAt, download]];
  } else return [];
});

function changeFile(fileList: FileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>
