<template>
  <div>
    <TableFull :headers="headers" :data="props.historique" />
  </div>
</template>

<script setup>
import { TableFull } from "@vao/shared";
import { formatDate } from "date-fns/format";
import DisplayTypePrecision from "~/components/demandes-sejour/DisplayTypePrecision.vue";

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
    text: "Email",
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
    format: (item) => formatDate(item.createdAt, "dd/MM/yyyy HH:mm"),
    text: "Date",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>
