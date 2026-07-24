<template>
  <nav v-if="pageCount > 1" class="fr-pagination" aria-label="Pagination">
    <ul class="fr-pagination__list">
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--first"
          :aria-disabled="modelValue === 1 ? 'true' : undefined"
          @click="modelValue !== 1 && $emit('update:modelValue', 1)"
        >
          Première page
        </button>
      </li>
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--prev"
          :disabled="modelValue === 1"
          @click="$emit('update:modelValue', modelValue - 1)"
        >
          Page précédente
        </button>
      </li>

      <li v-for="page in displayedPages" :key="page">
        <span
          v-if="page === '...'"
          class="fr-pagination__link fr-pagination__link--ellipsis"
          aria-hidden="true"
        >
          …
        </span>

        <button
          v-else
          class="fr-pagination__link"
          :disabled="page === modelValue"
          :aria-current="page === modelValue ? 'page' : undefined"
          @click="$emit('update:modelValue', page)"
        >
          {{ page }}
        </button>
      </li>

      <li>
        <button
          class="fr-pagination__link fr-pagination__link--next"
          :disabled="modelValue === pageCount"
          @click="$emit('update:modelValue', modelValue + 1)"
        >
          Page suivante
        </button>
      </li>
      <li>
        <button
          class="fr-pagination__link fr-pagination__link--last"
          :disabled="modelValue === pageCount"
          @click="$emit('update:modelValue', pageCount)"
        >
          Dernière page
        </button>
      </li>
    </ul>
  </nav>
  <p aria-live="polite" class="fr-text--sm fr-mt-1w">
    Résultats par page : 10 - Page {{ modelValue }} sur {{ pageCount }}
  </p>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  modelValue: number;
  pageCount: number;
}

const props = defineProps<Props>();

defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const displayedPages = computed<(number | "...")[]>(() => {
  const total = props.pageCount;
  const current = props.modelValue;

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
});
</script>
