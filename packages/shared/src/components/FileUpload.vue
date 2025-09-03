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
import { DsfrButtonGroup, DsfrFileUpload } from "@gouvminint/vue-dsfr";
import { computed } from "vue";
import dayjs from "dayjs";
const props = defineProps({
  modifiable: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
  cdnUrl: { type: String, required: true },
  isDisabled: { type: Boolean, default: false },
});
const headers = ["Fichier", "Date de création", "Actions"];
const file = defineModel({ type: Object });
const rows = computed(() => {
  if (file.value) {
    const name = file.value.uuid
      ? {
          component: "a",
          text: file.value.name,
          href: `${props.cdnUrl}/${file.value.uuid}`,
          download: true,
        }
      : file.value.name;
    const buttons = [
      {
        icon: "ri:delete-bin-2-line",
        iconOnly: true,
        tertiary: true,
        noOutline: true,
        onClick: removeFile,
        ariaLabel: `Supprimer le document ${file.value.name}`,
      },
    ];
    const createdAt = file.value.createdAt
      ? dayjs(file.value.createdAt).format("YYYY-MM-DD HH:mm")
      : "";
    return [
      [
        name,
        createdAt,
        {
          component: DsfrButtonGroup,
          buttons: props.modifiable && buttons,
        },
      ],
    ];
  } else return [];
});
function removeFile() {
  file.value = null;
}
function changeFile(fileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>
