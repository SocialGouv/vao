<template>
  <div>
    <div class="headings">
      <p>Nom de l’hébergement</p>
      <p>Adresse de l’hébergement</p>
      <p>
        période
        <DsfrTooltip
          content="Précisez la durée du séjour indépendamment du nombre de vacanciers présents."
        />
      </p>
      <p>Nombre de jours</p>
    </div>
    <AgrementBilanHebergementDetail
      v-for="(hebergement, index) in paginatedHebergements"
      :key="index"
      :hebergement="hebergement"
    />
    <DsfrPagination
      v-model:current-page="currentPage"
      :pages="pages"
      :trunc-limit="2"
      aria-label="Pagination des hébergements"
      next-page-title="Séjours suivants"
      prev-page-title="Séjours précédents"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  hebergements: {
    type: Array,
    required: true,
    default: () => [
      {
        adresseId: 1,
        agrementId: 1,
        mois: [6, 7, 8],
        nbVacanciers: 5,
        nomHebergement: "hebergement 3331399",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [1, 2],
        nbVacanciers: 8,
        nomHebergement: "hebergement 499953",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [7, 8, 9],
        nbVacanciers: 12,
        nomHebergement: "hebergement 223233",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [12],
        nbVacanciers: 4,
        nomHebergement: "hebergement 988833",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [3, 4, 5],
        nbVacanciers: 10,
        nomHebergement: "hebergement 111111",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [10, 11],
        nbVacanciers: 6,
        nomHebergement: "hebergement 31313",
      },
      {
        adresseId: 4,
        agrementId: 1,
        mois: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        nbVacanciers: 20,
        nomHebergement: "hebergement 4",
      },
      {
        adresseId: 5,
        agrementId: 1,
        mois: [],
        nbVacanciers: 0,
        nomHebergement: "hebergement 5",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [5, 6, 7],
        nbVacanciers: 15,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [8, 9],
        nbVacanciers: 18,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [10],
        nbVacanciers: 22,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 7,
        agrementId: 1,
        mois: [1, 3, 5, 7, 9, 11],
        nbVacanciers: 9,
        nomHebergement: "hebergement 7",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [6, 7, 8],
        nbVacanciers: 5,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [1, 2],
        nbVacanciers: 8,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [7, 8, 9],
        nbVacanciers: 12,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [12],
        nbVacanciers: 4,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [3, 4, 5],
        nbVacanciers: 10,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [10, 11],
        nbVacanciers: 6,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 4,
        agrementId: 1,
        mois: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        nbVacanciers: 20,
        nomHebergement: "hebergement 4",
      },
      {
        adresseId: 5,
        agrementId: 1,
        mois: [],
        nbVacanciers: 0,
        nomHebergement: "hebergement 5",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [5, 6, 7],
        nbVacanciers: 15,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [8, 9],
        nbVacanciers: 18,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [10],
        nbVacanciers: 22,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 7,
        agrementId: 1,
        mois: [1, 3, 5, 7, 9, 11],
        nbVacanciers: 9,
        nomHebergement: "hebergement 7",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [6, 7, 8],
        nbVacanciers: 5,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [1, 2],
        nbVacanciers: 8,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [7, 8, 9],
        nbVacanciers: 12,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [12],
        nbVacanciers: 4,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [3, 4, 5],
        nbVacanciers: 10,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [10, 11],
        nbVacanciers: 6,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 4,
        agrementId: 1,
        mois: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        nbVacanciers: 20,
        nomHebergement: "hebergement 4",
      },
      {
        adresseId: 5,
        agrementId: 1,
        mois: [],
        nbVacanciers: 0,
        nomHebergement: "hebergement 5",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [5, 6, 7],
        nbVacanciers: 15,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [8, 9],
        nbVacanciers: 18,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [10],
        nbVacanciers: 22,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 7,
        agrementId: 1,
        mois: [1, 3, 5, 7, 9, 11],
        nbVacanciers: 9,
        nomHebergement: "hebergement 7",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [6, 7, 8],
        nbVacanciers: 5,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [1, 2],
        nbVacanciers: 8,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [7, 8, 9],
        nbVacanciers: 12,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [12],
        nbVacanciers: 4,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [3, 4, 5],
        nbVacanciers: 10,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [10, 11],
        nbVacanciers: 6,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 4,
        agrementId: 1,
        mois: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        nbVacanciers: 20,
        nomHebergement: "hebergement 4",
      },
      {
        adresseId: 5,
        agrementId: 1,
        mois: [],
        nbVacanciers: 0,
        nomHebergement: "hebergement 5",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [5, 6, 7],
        nbVacanciers: 15,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [8, 9],
        nbVacanciers: 18,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [10],
        nbVacanciers: 22,
        nomHebergement: "hebergement 6",
      },
      {
        adresseId: 7,
        agrementId: 1,
        mois: [1, 3, 5, 7, 9, 11],
        nbVacanciers: 9,
        nomHebergement: "hebergement 7",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [6, 7, 8],
        nbVacanciers: 5,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 1,
        agrementId: 1,
        mois: [1, 2],
        nbVacanciers: 8,
        nomHebergement: "hebergement 1",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [7, 8, 9],
        nbVacanciers: 12,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 2,
        agrementId: 1,
        mois: [12],
        nbVacanciers: 4,
        nomHebergement: "hebergement 2",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [3, 4, 5],
        nbVacanciers: 10,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 3,
        agrementId: 1,
        mois: [10, 11],
        nbVacanciers: 6,
        nomHebergement: "hebergement 3",
      },
      {
        adresseId: 4,
        agrementId: 1,
        mois: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        nbVacanciers: 20,
        nomHebergement: "hebergement 4",
      },
      {
        adresseId: 5,
        agrementId: 1,
        mois: [],
        nbVacanciers: 0,
        nomHebergement: "hebergement 99923",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [5, 6, 7],
        nbVacanciers: 15,
        nomHebergement: "hebergement 93834",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [8, 9],
        nbVacanciers: 18,
        nomHebergement: "hebergement 13123123",
      },
      {
        adresseId: 6,
        agrementId: 1,
        mois: [10],
        nbVacanciers: 22,
        nomHebergement: "hebergement 13123123",
      },
      {
        adresseId: 7,
        agrementId: 1,
        mois: [1, 3, 5, 7, 9, 11],
        nbVacanciers: 9,
        nomHebergement: "hebergement 73131",
      },
    ],
  },
});

const ITEMS_PER_PAGE = 10;
const currentPage = ref(0);

const totalPages = computed(() =>
  Math.ceil(props.hebergements.length / ITEMS_PER_PAGE),
);

const paginatedHebergements = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  return props.hebergements.slice(start, start + ITEMS_PER_PAGE);
});

const pages = computed(() =>
  Array.from({ length: totalPages.value }, (_, i) => ({
    label: (i + 1).toString(),
    title: `Page ${i + 1}`,
    href: "#",
  })),
);
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin-bottom: 1rem;
}
</style>
