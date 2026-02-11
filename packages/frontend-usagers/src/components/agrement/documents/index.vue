<template>
  <!-- TODO Filtrer ou mettre l'objet correspondant aux documents des DREETS-->
  <div
    v-if="
      props.initAgrement.dreetsFiles &&
      props.initAgrement.dreetsFiles.length > 0
    "
  >
    <TableFull
      title="Documents de la DREETS"
      :headers="headers"
      :data="props.initAgrement.dreetsFiles"
    />
  </div>
  <div
    v-if="
      props.initAgrement.agrementFiles &&
      props.initAgrement.agrementFiles.length > 0
    "
  >
    <TableFull
      title="Documents de l'OVA"
      :headers="headers"
      :data="props.initAgrement.agrementFiles"
    />
  </div>
</template>

<script setup lang="ts">
import { TableFull } from "@vao/shared-ui";
import {
  formatFRDateTime,
  type FILE_CATEGORY,
  getFileCategoryLabel,
} from "@vao/shared-bridge";

const config = useRuntimeConfig();
const NuxtLink = resolveComponent("NuxtLink");

const props = defineProps({
  initAgrement: { type: Object, required: true },
});

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
    format: (item: any) => getFileCategoryLabel(item.category as FILE_CATEGORY),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "createdAt",
    sorter: "createdAt",
    format: (item: any) => formatFRDateTime(item.createdAt),
    text: "Date de dépose",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    text: "téléchargement",
    component: (file: any) => {
      return {
        component: NuxtLink,
        to: `${config.public.backendUrl}/documents/${file.uuid}`,
        class: "fr-icon-file-download-fill",
      };
    },
  },
];
</script>
