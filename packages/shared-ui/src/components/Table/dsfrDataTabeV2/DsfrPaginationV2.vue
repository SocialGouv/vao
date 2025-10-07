<template>
  <div class="fr-table__footer">
    <div class="fr-table__footer--start">
      <p class="fr-table__detail">
        {{ props.total }} ligne{{ props.total > 1 ? "s" : "" }}
      </p>
      <div class="fr-select-group">
        <label class="fr-sr-only fr-label" for="table-footer-select">
          Nombre de lignes par page
        </label>
        <select
          id="table-footer-select"
          v-model="limitSync"
          class="fr-select"
          name="table-footer-select"
        >
          <option value="" disabled hidden>Nombre de lignes par page</option>
          <option
            v-for="option in nbItemsOptions"
            :key="option"
            :value="option"
          >
            {{ option }} ligne{{ option > 1 ? "s" : "" }} par page
          </option>
        </select>
      </div>
    </div>
    <div class="fr-table__footer--middle">
      <nav role="navigation" class="fr-pagination" aria-label="Pagination">
        <ul class="fr-pagination__list">
          <li>
            <a
              class="fr-pagination__link fr-pagination__link--first"
              title="Première page"
              :aria-disabled="offset === 0"
              role="link"
              :href="route.hash ? route.hash : '#'"
              @click="offset === 0 ? null : goToPage(1)"
            >
              Première page
            </a>
          </li>
          <li>
            <a
              class="fr-pagination__link fr-pagination__link--prev fr-pagination__link--lg-label"
              title="Précédente"
              :aria-disabled="offset === 0"
              role="link"
              :href="route.hash ? route.hash : '#'"
              @click="offset === 0 ? null : goToPage(currentPage - 1)"
            >
              Précédente
            </a>
          </li>
          <li v-for="page in displayedPages" :key="page">
            <a
              class="fr-pagination__link"
              :class="{ 'fr-pagination__link--current': page === currentPage }"
              :aria-current="page === currentPage ? 'page' : undefined"
              :title="`Page ${page}`"
              aria-disabled="false"
              :href="route.hash ? route.hash : '#'"
              @click="page === currentPage ? null : goToPage(page)"
            >
              {{ page }}
            </a>
          </li>
          <li>
            <a
              class="fr-pagination__link fr-pagination__link--next fr-pagination__link--lg-label"
              title="Suivante"
              :aria-disabled="props.offset + props.limit >= total"
              :href="route.hash ? route.hash : '#'"
              @click="
                props.offset + props.limit >= total
                  ? null
                  : goToPage(currentPage + 1)
              "
            >
              Suivante
            </a>
          </li>
          <li>
            <a
              class="fr-pagination__link fr-pagination__link--last"
              title="Dernière page"
              :aria-disabled="props.offset + props.limit >= total"
              :href="route.hash ? route.hash : '#'"
              @click="
                props.offset + props.limit >= total
                  ? null
                  : goToPage(totalPages)
              "
            >
              Dernière page
            </a>
          </li>
        </ul>
      </nav>
    </div>
    <div class="fr-table__footer--end">
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const route = useRoute();

const props = withDefaults(
  defineProps<{
    total: number;
    offset: number;
    limit: number;
    nbItemsOptions?: number[];
  }>(),
  {
    nbItemsOptions: () => [5, 10, 20, 50],
  },
);

const emits = defineEmits<{
  "update:offset": [number];
  "update:limit": [number];
  navigationChange: [];
}>();

const limitSync = computed({
  get() {
    return props.limit;
  },
  set(value) {
    emits("update:limit", value);
  },
});

const currentPage = computed(() => Math.floor(props.offset / props.limit) + 1);

const totalPages = computed(() => Math.ceil(props.total / props.limit));

const displayedPages = computed(() => {
  if (totalPages.value <= 3) {
    return Array.from({ length: totalPages.value }, (_, i) => i + 1);
  }

  if (currentPage.value === 1) {
    return [1, 2, 3];
  }

  if (currentPage.value === totalPages.value) {
    return [totalPages.value - 2, totalPages.value - 1, totalPages.value];
  }

  return [currentPage.value - 1, currentPage.value, currentPage.value + 1];
});

const goToPage = (page: number) => {
  const newOffset = (page - 1) * props.limit;
  emits("update:offset", newOffset);
  emits("navigationChange");
};
</script>

<style scoped lang="scss">
.fr-pagination__link[aria-disabled="true"]:not(.fr-pagination__link--current) {
  color: var(--text-disabled-grey);
  cursor: not-allowed;
}
</style>
