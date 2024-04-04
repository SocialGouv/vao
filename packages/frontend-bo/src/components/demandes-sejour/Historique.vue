<template>
  <div>
    <UtilsTableFull :headers="headers" :data="props.historique">
    </UtilsTableFull>
  </div>
</template>

<script setup>
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
    text: "email organisateur",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "userAdminId",
    sorter: "userAdminId",
    text: "Id utilisateur administratif",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "type",
    sorter: "type",
    text: "Type",
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
    text: "Date de dépose",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>
