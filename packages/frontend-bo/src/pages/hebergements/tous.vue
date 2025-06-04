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
const hebergementStore = useHebergementStore();

const columns = [
  {
    key: "nom",
    label: "Nom",
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
  const response = await hebergementStore.exportHebergements(true, {});
  exportCsv(response, "hébergements.csv");
};

const total = computed(() => hebergementStore.hebergementsCount);
const title = computed(() => `Liste des hébergements (${total.value})`);
const hebergements = computed(() => hebergementStore.hebergements);

const redirection = (row) => `/hebergement/tous/${row.id}`;
</script>
