<template>
  <div>
    <TableFull
      :headers="headers"
      :data="props.historique"
      :sort-direction-init="-1"
      sort-by-init="createdAt"
    />
  </div>
</template>

<script setup>
import { TableFull } from "@vao/shared-ui";
import dayjs from "dayjs";
import DisplayTypePrecision from "~/components/DS/DisplayTypePrecision.vue";

const props = defineProps({
  historique: { type: Array, required: true },
});

const headers = [
  {
    column: "source",
    sorter: "source",
    text: "Emetteur",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "userEmail",
    sorter: "userEmail",
    text: "Adresse courriel",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "typePrecision",
    sorter: "typePrecision",
    component: ({ typePrecision, metaData }) => ({
      component: DisplayTypePrecision,
      typePrecision: typePrecision,
      commentaire: metaData.commentaire ?? null,
    }),
    text: "Détail",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "createdAt",
    sorter: "createdAt",
    format: (item) => dayjs(item.createdAt).format("DD/MM/YYYY HH:mm"),
    text: "Date",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>

<style scoped>
.pj-container {
  margin-bottom: 3em;
}
</style>
