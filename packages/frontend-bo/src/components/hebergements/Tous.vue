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
  <DsfrButton
    v-if="hebergementStore"
    type="button"
    label="Extraire en CSV"
    primary
    @click="getCsv"
  />
</template>

<script setup>
import dayjs from "dayjs";

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
      row.dateVisite ? dayjs(row.dateVisite).format("DD/MM/YYYY") : "",
  },
  {
    column: "reglementatioEerp",
    text: "Réglementation erp",
    sort: true,
    format: (row) => (row.reglementationrp ? "Oui" : "Non"),
  },
];

const redirectOnHebergement = (row) => {
  navigateTo(`/hebergements/tous/${row.id}`);
};

const table = ref(null);

const getCsv = async () => {
  const response = await hebergementStore.exportHebergements(true, {});
  exportCsv(response, "hébergements.csv");
};

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
