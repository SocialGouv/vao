<template>
  <HebergementsFilters
    v-model:nom="nom"
    v-model:adresse="adresse"
    @filters-update="updateData"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :titles="titles"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="id"
    is-sortable
    @update-data="updateData"
  >
    <template #cell:custom-name="{ row }">
      {{ row.nom }}
    </template>
    <template #cell:departement-label="{ row }">
      {{
        row.departement
          ? departementStore.departements.find(
              ({ value }) => value === row.departement,
            )?.text
          : "Inconnu"
      }}
    </template>
    <template #cell:custom-statut="{ row }">
      <div>
        <HebergementStatusBadge :statut="row.statut" />
      </div>
    </template>
    <template #cell:custom-edit="{ row }">
      <NuxtLink
        :to="`/hebergements/${row.id}`"
        title="Naviguer vers l'hébergement"
        class="no-background-image"
      >
        <DsfrButton
          icon="ri:arrow-right-s-line"
          icon-only
          primary
          size="small"
          type="button"
        />
      </NuxtLink>
    </template>
  </DsfrDataTableV2Wrapper>
</template>

<script setup>
import { DsfrDataTableV2Wrapper } from "@vao/shared";
import HebergementStatusBadge from "./HebergementStatusBadge.vue";
const hebergementStore = useHebergementStore();
const departementStore = useDepartementStore();
const route = useRoute();

const data = computed(() => hebergementStore.hebergements);
const total = computed(() => hebergementStore.hebergementsTotal);
const { query } = route;
const titles = [
  {
    key: "nom",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "departement-label",
    label: "Département",
  },
  {
    key: "adresse",
    label: "Adresse",
  },
  {
    key: "custom-statut",
    label: "Statut",
  },
  {
    key: "custom-edit",
    label: "Action",
  },
];
const title = "Liste des Hébergements";
const sortableTitles = titles.flatMap((title) =>
  title.options?.isSortable ? [title.key] : [],
);
const nom = ref(query.nom ?? "");
const adresse = ref(query.adresse ?? "");
const limit = ref(parseInt(query.limit, 10) || 10);
const offset = ref(parseInt(query.offset, 10) || 0);
const sort = ref(sortableTitles.includes(query.sort) ? query.sort : "");
const sortDirection = ref(
  ["", "asc", "desc"].includes(query.sortDirection) ? query.sortDirection : "",
);
const isValidParams = (params) =>
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);
const getSearchParams = () => ({
  ...(isValidParams(nom.value) ? { nom: nom.value } : {}),
  ...(isValidParams(adresse.value) ? { adresse: adresse.value } : {}),
});
let timeout = null;
departementStore.fetch();

const updateData = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const query = {
      limit: limit.value,
      offset: offset.value,
      ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
      ...(isValidParams(sortDirection.value)
        ? { sortDirection: sortDirection.value.toUpperCase() }
        : {}),
      ...getSearchParams(),
    };
    hebergementStore.fetch(query);
    navigateTo({
      query: {
        limit: limit.value,
        offset: offset.value,
        ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
        ...(isValidParams(sortDirection.value)
          ? { sortDirection: sortDirection.value }
          : {}),
        ...getSearchParams(),
      },
    });
  }, 300);
};
updateData();
onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
