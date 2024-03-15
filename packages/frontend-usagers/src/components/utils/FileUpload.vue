<template>
  <div class="fr-fieldset__element">
    <div class="fr-input-group" style="margin-bottom: 2rem">
      <div v-if="rows.length > 0">
        <DsfrTable :headers="headers" :rows="rows" />
      </div>

      <DsfrFileUpload v-bind="$attrs" @change="changeFile" />
    </div>
  </div>
</template>

<script setup>
import { DsfrButtonGroup } from "@gouvminint/vue-dsfr";
import dayjs from "dayjs";

const config = useRuntimeConfig();

const headers = ["Fichier", "Date de création", "Actions"];

const file = defineModel({ type: Object });

const rows = computed(() => {
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
        buttons,
      },
    ],
  ];
});

function removeFile() {
  file.value = null;
}

function changeFile(fileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>

<style lang="scss" scoped></style>
