<template>
  <div class="fr-fieldset__element">
    <div class="fr-input-group" style="margin-bottom: 2rem">
      <div v-if="!props.modifiable">
        <label>{{ $attrs.label }}</label>
      </div>
      <div v-if="rows.length > 0">
        <DsfrTable :headers="headers" :rows="rows" />
      </div>

      <DsfrFileUpload
        v-if="props.modifiable"
        v-bind="$attrs"
        :error="props.errorMessage"
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
  </div>
</template>

<script setup>
import { DsfrButtonGroup } from "@gouvminint/vue-dsfr";
import dayjs from "dayjs";

const props = defineProps({
  modifiable: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
});
const config = useRuntimeConfig();

const headers = ["Fichier", "Date de création", "Actions"];

const file = defineModel({ type: Object });

const rows = computed(() => {
  if (file.value) {
    const name = file.value.uuid
      ? {
          component: "a",
          text: file.value.name,
          href: `${config.public.backendUrl}/documents/${file.value.uuid}`,
          download: true,
        }
      : file.value.name;

    const buttons = [
      {
        icon: "ri-delete-bin-2-line",
        iconOnly: true,
        tertiary: true,
        noOutline: true,
        onClick: removeFile,
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

<style lang="scss" scoped></style>
