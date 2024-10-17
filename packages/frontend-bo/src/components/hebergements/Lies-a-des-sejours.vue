<template>
  <HebergementsTable
    ref="table"
    :headers="headers"
    :data="hebergements"
    :count="count"
    :action="demandeSejourStore.getHebergements"
    is-url-update
    @click-on-cell="redirectOnHebergement"
  />
  <DsfrButton
    v-if="hebergements"
    type="button"
    label="Extraire en CSV"
    primary
    @click="getCsv"
  />
</template>

<script setup>
import dayjs from "dayjs";

const demandeSejourStore = useDemandeSejourStore();

const headers = [
  {
    column: "nom",
    text: "Nom",
    sort: true,
  },
  {
    column: "dateSejour",
    text: "Date du séjour",
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
    text: "Adresse courriel",
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
  navigateTo(
    `/hebergements/lie-a-des-sejours/${row.declarationId}/${row.hebergementIndex}`,
  );
};

const table = ref(null);

const getCsv = async () => {
  const response = await demandeSejourStore.exportHebergements();
  exportCsv(response, "hébergements-sejours.csv");
};

defineExpose({
  refreshTable() {
    if (table.value) {
      table.value.refreshTable();
    }
  },
});

const count = computed(() => demandeSejourStore.hebergementsCount);
const hebergements = computed(() => demandeSejourStore.hebergements);
</script>
