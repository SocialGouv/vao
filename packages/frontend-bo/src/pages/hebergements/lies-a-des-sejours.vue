<template>
  <div>
    <HebergementsTable
      :data="hebergements"
      :total="total"
      :action="demandeSejourStore.getHebergements"
      :columns="columns"
      :title="title"
      :redirection="redirection"
      @get-csv="getCsv"
    />
  </div>
</template>

<script setup>
import { columnsTable } from "@vao/shared-ui";

const demandeSejourStore = useDemandeSejourStore();
const optionType = columnsTable.optionType;
const defs = [
  ["nom", "Nom", optionType.SORTABLE],
  ["dateSejour", "Date du séjour", optionType.SORTABLE],
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
  const response = await demandeSejourStore.exportHebergements();
  exportCsv(response, "hébergements-sejours.csv");
};

const total = computed(() => demandeSejourStore.hebergementsCount);
const title = computed(
  () => `Liste des hébergements liés à un séjour (${total.value})`,
);
const hebergements = computed(() => demandeSejourStore.hebergements);

const redirection = (row) =>
  `/hebergement/lies-a-des-sejours/${row.declarationId}/${row.hebergementId}`;
</script>
