<template>
  <TableFull :headers="headers" :data="personnel" />
</template>
<script setup>
import { TableFull } from "@vao/shared";
import dayjs from "dayjs";

defineProps({
  personnel: { required: true, default: () => [], type: Array },
});

const headers = [
  {
    column: "nom",
    sorter: "nom",
    text: "Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "prenom",
    sorter: "prenom",
    text: "Prénom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateNaissance",
    sorter: "dateNaissance",
    format: (item) => dayjs(item.dateNaissance).format("DD/MM/YYYY"),
    text: "Date de naissance",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "telephone",
    sorter: "telephone",
    text: "Téléphone",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "listeFonction",
    sorter: "listeFonction",
    format: (item) => item.listeFonction.join(", "),
    text: "Fonctions",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>
