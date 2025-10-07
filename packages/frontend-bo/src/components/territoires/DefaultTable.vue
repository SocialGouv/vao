<template>
  <TerritoiresDefaultTableFilters
    v-model:label="label"
    @filters-update="() => updateData(true)"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :columns="columns"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="territoireId"
    is-sortable
    @update-data="() => updateData()"
  >
    <template #cell-typeTerritoire="{ row }">
      {{ row.type === "DEP" ? "Département" : "Région" }}
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="`/territoires/${row.territoireId}`"
        title="Naviguer vers la fiche territoire"
        class="no-background-image"
      >
        <DsfrButton
          :label="
            ['FRA', row.code, row.parent].includes(
              userStore.user.territoireCode,
            )
              ? 'Editer la fiche territoire'
              : 'Consulter la fiche territoire'
          "
          :icon="
            ['FRA', row.code, row.parent].includes(
              userStore.user.territoireCode,
            )
              ? 'fr-icon-edit-fill'
              : 'fr-icon-eye-fill'
          "
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
import {
  DsfrDataTableV2Wrapper,
  isValidParams,
  usePagination,
  columnsTable,
} from "@vao/shared-ui";

const territoireStore = useTerritoireStore();
const userStore = useUserStore();
const route = useRoute();
const data = computed(() => territoireStore.territoires);
const total = computed(() => territoireStore.total);
const optionType = columnsTable.optionType;

const { query } = route;

const defs = [
  ["label", "Libellé", optionType.SORTABLE],
  ["typeTerritoire", "Département/Région"],
  ["nbUsersBo", "Contacts"],
  ["code", "Code", optionType.SORTABLE],
  ["correspVaoNom", "Référent VAO"],
  ["serviceTelephone", "Téléphone"],
  ["serviceMail", "Boite fonctionnelle"],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];

const columns = columnsTable.buildColumns(defs);

const title = computed(
  () => `Liste des territoires (${territoireStore.total})`,
);

const sortableColumns = columns.flatMap((c) =>
  c.options?.isSortable ? [c.key] : [],
);

const label = ref(query.label ?? "");

const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

let timeout = null;

const updateData = (resetOffset = false) => {
  if (resetOffset) {
    offset.value = 0;
  }
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const queryParam = {
      limit: limit.value,
      offset: offset.value,
      ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
      ...(isValidParams(sortDirection.value)
        ? { sortDirection: sortDirection.value.toUpperCase() }
        : {}),
      ...(isValidParams(label.value) ? { label: label.value } : {}),
    };

    territoireStore.fetch(queryParam);
    navigateTo({ query });
  }, 300);
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});

updateData();
</script>
