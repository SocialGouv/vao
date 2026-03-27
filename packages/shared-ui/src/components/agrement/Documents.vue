<template>
  <div v-if="dreetsFiles && dreetsFiles.length > 0">
    <TableFull
      title="Documents de la DREETS"
      :headers="headers"
      :data="dreetsFiles"
    />
  </div>
  <div v-if="ovaFiles && ovaFiles.length > 0">
    <TableFull title="Documents de l'OVA" :headers="headers" :data="ovaFiles" />
  </div>
</template>

<script setup lang="ts">
import { TableFull } from "@vao/shared-ui";
import {
  type AgrementFilesDto,
  type DocumentDto,
  formatFRDateTime,
  getFileCategoryLabel,
} from "@vao/shared-bridge";

const config = useRuntimeConfig();
const NuxtLink = resolveComponent("NuxtLink");
const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const dreetsFiles = computed(
  () =>
    props.initAgrement?.agrementFiles?.filter(
      (agrementFile: DocumentDto) => agrementFile.userId === null,
    ) ?? [],
);

const ovaFiles = computed(
  () =>
    props.initAgrement?.agrementFiles?.filter(
      (agrementFile: DocumentDto) => agrementFile.userId !== null,
    ) ?? [],
);

const headers = [
  {
    column: "name",
    sorter: "name",
    text: "Nom du fichier",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "category",
    sorter: "category",
    text: "Type de fichier",
    format: (item: AgrementFilesDto) => getFileCategoryLabel(item.category!),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "createdAt",
    sorter: "createdAt",
    format: (item: DocumentDto) => formatFRDateTime(item.createdAt!),
    text: "Date de dépose",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    text: "téléchargement",
    component: (file: DocumentDto) => {
      return {
        component: NuxtLink,
        to: `${config.public.backendUrl}/documents/${file.uuid}`,
        class: "fr-icon-file-download-fill",
      };
    },
  },
];
</script>
