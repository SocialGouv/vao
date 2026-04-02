<template>
  <div>
    <div class="headings">
      <p class="fr-mb-0">Nom de l'hébergement</p>
      <p class="fr-mb-0">Adresse de l'hébergement</p>
      <p class="fr-mb-0">Période</p>
      <p class="fr-mb-0">
        <span>Nombre jours</span>
        <DsfrTooltip
          class="fr-ml-2v"
          content="Précisez la durée du séjour indépendamment du nombre de vacanciers présents."
        />
      </p>
      <p></p>
    </div>
    <AgrementsBilanHebergementDetail
      v-for="(hebergement, index) in paginatedHebergements"
      :key="`${hebergement.agrBilanAnnuelId}-${hebergement.adresseId}-${index}`"
      :hebergement="hebergement"
    />
    <div class="fr-mt-2v">
      <!-- Formulaire d'ajout de séjour -->
      <div class="fr-mt-6v">
        <DsfrInput
          name="nomHebergement"
          type="text"
          label="Nom de l'hébergement"
          :model-value="nomHebergement"
          :label-visible="true"
        />
      </div>
      <div class="fr-mt-6v">
        <p class="fr-mb-0">Période</p>
        <AgrementsBilanSelectMonths />
      </div>
      <div class="fr-mt-6v">
        <DsfrInput
          name="nbJours"
          type="number"
          label="nombre de jours"
          :model-value="nbJours"
        />
      </div>
    </div>
    <!-- Pagination -->
    <div class="pagination-center">
      <DsfrPagination
        v-if="totalPages > 1"
        v-model:current-page="currentPage"
        :pages="pages"
        :trunc-limit="2"
        next-page-title="séjours suivants"
        prev-page-title="séjours précédents"
        current-page-title-suffix=" - page courante"
        class="fr-mt-4v fr-col-12"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  bilanHebergement: {
    type: Array,
    required: false,
    default: () => [],
  },
});

const localHebergements = ref([...props.bilanHebergement]);

const ITEMS_PER_PAGE = 10;
const currentPage = ref(0);

const totalPages = computed(() => {
  return Math.ceil(localHebergements.value.length / ITEMS_PER_PAGE);
});

const pages = computed(() => {
  const pageArray = [];
  for (let i = 1; i <= totalPages.value; i++) {
    pageArray.push({
      title: `Lien vers la page ${i}`,
      href: `#${i}`,
      label: `${i}`,
    });
  }
  return pageArray;
});

const paginatedHebergements = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return localHebergements.value.slice(start, end);
});
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  gap: 0 0.5rem;
  margin-bottom: 1rem;
}
</style>
