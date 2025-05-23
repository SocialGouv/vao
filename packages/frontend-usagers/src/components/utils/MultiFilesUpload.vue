<template>
  <div class="fr-fieldset__element">
    <div v-if="rows.length > 0">
      <DsfrTable
        title="Fichier(s) téléversé(s)"
        :headers="headers"
        :rows="rows"
      />
    </div>
    <div class="fr-input-group">
      <DsfrFileUpload
        v-if="props.modifiable"
        v-bind="$attrs"
        @change="changeFiles"
      />
    </div>
  </div>
</template>

<script setup>
import { DsfrButtonGroup } from "@gouvminint/vue-dsfr";
import dayjs from "dayjs";

const props = defineProps({
  modifiable: { type: Boolean, default: true },
});
const config = useRuntimeConfig();

const headers = ["Fichier", "Date de création", "Actions"];

const files = defineModel({ type: Array });

const rows = computed(() => {
  return files.value.map((file, index) => {
    const name = file.uuid
      ? {
          component: "a",
          text: file.name,
          href: `${config.public.backendUrl}/documents/${file.uuid}`,
          download: true,
        }
      : file.name;
    const buttons = [
      {
        icon: "ri:delete-bin-2-line",
        iconOnly: true,
        tertiary: true,
        noOutline: true,
        onClick: () => removeFile(index),
      },
    ];
    const createdAt = file.createdAt
      ? dayjs(file.createdAt).format("YYYY-MM-DD HH:mm")
      : "";
    return [
      name,
      createdAt,
      {
        component: DsfrButtonGroup,
        buttons: props.modifiable && buttons,
      },
    ];
  });
});

function removeFile(index) {
  files.value = [
    ...files.value.slice(0, index),
    ...files.value.slice(index + 1),
  ];
}

function changeFiles(fileList) {
  files.value = [...files.value, ...fileList];
}
</script>

<style lang="scss" scoped></style>
