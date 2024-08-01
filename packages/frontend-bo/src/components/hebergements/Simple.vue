<template>
  <HebergementsTable
    ref="table"
    :headers="headers"
    :data="hebergements"
    :count="count"
    :action="hebergementStore.getHebergements"
    is-url-update
    @click-on-cell="redirectOnHebergement"
  />
</template>

<script setup>
import { formatDate } from "date-fns";

const hebergementStore = useHebergementStore();

const headers = [
  {
    column: "nom",
    text: "Nom",
    sort: true,
  },
  {
    column: "departement",
    text: "Département",
    sort: true,
  },
  {
    column: "adresse",
    text: "Adresse",
    format: (row) => row.adresse.label,
  },
  {
    column: "telephone",
    text: "Téléphone",
    format: (row) => (row.telephone || "").replace(/(\d{2})(?=\d)/g, "$1 "),
  },
  {
    column: "email",
    text: "Courriel",
    sort: true,
  },
  {
    column: "dateVisite",
    text: "Date dernière visite",
    sort: true,
    format: (row) =>
      row.dateVisite ? formatDate(row.dateVisite, "dd/MM/yyyy") : "",
  },
  {
    column: "reglementatioEerp",
    text: "Réglementation erp",
    sort: true,
    format: (row) => (row.reglementationrp ? "Oui" : "Non"),
  },
];

const redirectOnHebergement = (row) => {
  navigateTo(`/hebergements/simple/${row.id}`);
};

const table = ref(null);

defineExpose({
  refreshTable() {
    if (table.value) {
      table.value.refreshTable();
    }
  },
});

const count = computed(() => hebergementStore.hebergementsCount);
const hebergements = computed(() => hebergementStore.hebergements);
</script>
