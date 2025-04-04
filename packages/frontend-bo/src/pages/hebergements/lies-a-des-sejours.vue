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
const demandeSejourStore = useDemandeSejourStore();

const columns = [
  {
    key: "nom",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "dateSejour",
    label: "Date du séjour",
    options: {
      isSortable: true,
    },
  },
  {
    key: "departement",
    label: "Département",
    options: {
      isSortable: true,
    },
  },
  {
    key: "adresse",
    label: "Adresse",
    options: {
      isSortable: true,
    },
  },
  {
    key: "telephone",
    label: "Téléphone",
    options: {
      isSortable: true,
    },
  },
  {
    key: "email",
    label: "Courriel",
    options: {
      isSortable: true,
    },
  },
  {
    key: "dateVisite",
    label: "Date dernière visite",
    options: {
      isSortable: true,
    },
  },
  {
    key: "reglementationErp",
    label: "Réglementation erp",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom:edit",
    label: "Action",
    options: {
      isFixedRight: true,
    },
  },
];

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
