<template>
  <div class="fr-input-group" style="margin-bottom: 2rem">
    <div v-if="!props.modifiable">
      <label>{{ $attrs.label }}</label>
    </div>
    <div v-if="rows.length > 0">
      <DsfrTable
        title="Fichier(s) téléversé(s)"
        :headers="headers"
        :rows="rows"
        :no-caption="true"
      />
    </div>

    <DsfrFileUpload
      v-if="props.modifiable"
      v-bind="$attrs"
      :error="props.errorMessage"
      :disabled="isDisabled"
      @change="changeFile"
    />
    <div
      v-else-if="props.errorMessage"
      class="fr-input-group fr-input-group--error"
    >
      <label class="fr-label">
        {{ props.errorMessage }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { DsfrFileUpload } from "@gouvminint/vue-dsfr";
import { computed } from "vue";
import dayjs from "dayjs";
const props = defineProps({
  modifiable: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
  cdnUrl: { type: String, required: true },
  isDisabled: { type: Boolean, default: false },
});
const headers = [
  "Nom du fichier",
  "Type de fichier",
  "Date de création",
  "Téléchargement",
];
const file = defineModel({ type: Object });
const rows = computed(() => {
  if (file.value) {
    const name = file.value.name;
    const extension = name.split(".").pop()?.toLowerCase() || "-";
    const type = extension;
    const createdAt = file.value.createdAt
      ? dayjs(file.value.createdAt).format("YYYY-MM-DD HH:mm")
      : "";
    const download = file.value.uuid
      ? {
          component: "a",
          innerHTML:
            '<span class="fr-icon-file-download-fill" aria-hidden="true"></span>',
          href: `${props.cdnUrl}/${file.value.uuid}`,
          download: true,
          "aria-label": `Télécharger le fichier ${file.value.name}`,
          title: `Télécharger le fichier ${file.value.name}`,
          style: "background: none;",
        }
      : "-";
    return [[name, type, createdAt, download]];
  } else return [];
});

function changeFile(fileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>
