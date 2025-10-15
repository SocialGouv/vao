<template>
  <div>
    <HebergementsTable
      :data="hebergements"
      :total="total"
      :action="hebergementStore.getHebergements"
      :columns="columns"
      :title="title"
      :redirection="redirection"
      @get-csv="getCsv"
    />
  </div>
</template>

<script setup>
import { columnsTable } from "@vao/shared-ui";

const optionType = columnsTable.optionType;
const hebergementStore = useHebergementStore();

const defs = [
  ["nom", "Nom", optionType.SORTABLE],
  ["departement", "Département", optionType.SORTABLE],
  ["adresse", "Adresse", optionType.SORTABLE],
  ["telephone", "Téléphone", optionType.SORTABLE],
  ["email", "Courriel", optionType.SORTABLE],
  ["dateVisite", "Date dernière visite", optionType.SORTABLE],
  ["reglementationErp", "Réglementation erp", optionType.SORTABLE],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];

const columns = columnsTable.buildColumns(defs);

const getCsv = async () => {
  const response = await hebergementStore.exportHebergements(true, {});
  exportCsv(response, "hébergements.csv");
};

const total = computed(() => hebergementStore.hebergementsCount);
const title = computed(() => `Liste des hébergements (${total.value})`);
const hebergements = computed(() => hebergementStore.hebergements);

const redirection = (row) => `/hebergement/tous/${row.id}`;
</script>
