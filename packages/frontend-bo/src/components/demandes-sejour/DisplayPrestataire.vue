<template>
  <UtilsTableFull :headers="headers" :data="personnel" />
</template>
<script setup>
import { formatDate } from "date-fns/format";

defineProps({
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
      value.dateNaissance ? formatDate(value.dateNaissance, "dd/MM/yyyy") : "",
    text: "Date de naissance",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "competence",
    sorter: "competence",
    text: "Compétence",
    headerAttrs: {
      class: "suivi",
    },
  },
];
</script>
