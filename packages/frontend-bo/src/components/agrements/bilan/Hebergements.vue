<template>
  <div>
    <div class="headings">
      <p>Nom de l'hébergement</p>
      <p>Adresse</p>
      <p>Période</p>
      <p>Nombre de jours</p>
    </div>

    <div
      v-for="(hebergement, index) in paginatedHebergements"
      :key="index"
      class="row"
    >
      <p>{{ hebergement.nomHebergement || "-" }}</p>

      <p>{{ hebergement.adresse?.label || "-" }}</p>

      <p>{{ formatMois(hebergement.mois) }}</p>

      <p>{{ hebergement.nbJours ?? "-" }}</p>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-center">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: currentPage === page - 1 }"
        @click="currentPage = page - 1"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { BilanHebergementDto } from "@vao/shared-bridge";

const props = defineProps<{
  hebergements: BilanHebergementDto[];
}>();

const ITEMS_PER_PAGE = 10;
const currentPage = ref(0);

const totalPages = computed(() =>
  Math.ceil((props.hebergements?.length || 0) / ITEMS_PER_PAGE),
);

const paginatedHebergements = computed(() => {
  const start = currentPage.value * ITEMS_PER_PAGE;
  return (props.hebergements || []).slice(start, start + ITEMS_PER_PAGE);
});

function formatMois(mois: number[] | null): string {
  if (!mois || mois.length === 0) return "-";

  const moisLabels = [
    "janvier",
    "février",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "août",
    "septembre",
    "octobre",
    "novembre",
    "décembre",
  ];

  return mois.map((m) => moisLabels[m - 1] || m).join(", ");
}
</script>

<style scoped>
.headings {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr;
  gap: 0.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.row {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.pagination-center {
  margin-top: 1rem;
}

button.active {
  font-weight: bold;
}
</style>
