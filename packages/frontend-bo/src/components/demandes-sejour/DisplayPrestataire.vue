<template>
  <TableFull :title="title" :headers="headers" :data="personnel" />
</template>
<script setup>
import { TableFull } from "@vao/shared";
import dayjs from "dayjs";

defineProps({
  title: { required: true, type: String },
  personnel: { required: true, default: () => [], type: Array },
});

const headers = [
  {
    column: "nom",
    sorter: "nom",
    text: "Raison Sociale / Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "prenom",
    sorter: "prenom",
    text: "Nom Commercial / Prénom",
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
    column: "adresse",
    sorter: "adresse",
    text: "Adresse",
    format: (value) => value?.adresse?.label,
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateNaissance",
    sorter: "dateNaissance",
    format: (value) =>
      value.dateNaissance
        ? dayjs(value.dateNaissance).format("DD/MM/YYYY")
        : "",
    text: "Date de naissance",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "competence",
    sorter: "competence",
    text: "Compétence / Expérience",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>
