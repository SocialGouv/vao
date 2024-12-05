<template>
  <TerritoiresDefaultTableFilters
    v-model:label="label"
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
    row-id="territoireId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell:typeTerritoire="{ row }">
      {{ row.type === "DEP" ? "Département" : "Région" }}
    </template>
    <template #cell:custom-edit="{ row }">
      <DsfrButton
        :label="
          ['FRA', row.code, row.parent].includes(userStore.user.territoireCode)
            ? 'Editer la fiche territoire'
            : 'Consulter la fiche territoire'
        "
        :icon="
          ['FRA', row.code, row.parent].includes(userStore.user.territoireCode)
            ? 'fr-icon-edit-fill'
            : 'fr-icon-eye-fill'
        "
        icon-only
        primary
        size="small"
        type="button"
        @click="navigate(row)"
      />
    </template>
  </DsfrDataTableV2Wrapper>
</template>

<script setup>

import { DsfrDataTableV2Wrapper } from "@vao/shared";

const territoireStore = useTerritoireStore();
const userStore = useUserStore();
const route = useRoute();
const data = computed(() => territoireStore.territoires);
const total = computed(() => territoireStore.total);

const { query } = route;

const titles = [
  {
    key: "label",
    label: "Libellé",
    options: {
      isSortable: true,
    },
  },
  {
    key: "typeTerritoire",
    label: "Département/Région",
    options: {
      isSortable: false,
    },
  },
  {
    key: "nbUsersBo",
    label: "Contacts",
    sort: false,
  },
  {
    key: "code",
    label: "Code",
    options: {
      isSortable: true,
    },
  },
  {
    key: "correspVaoNom",
    label: "Référent VAO",
    options: {
      isSortable: false,
    },
  },
  {
    key: "serviceTelephone",
    label: "Téléphone",
    options: {
      isSortable: false,
    },
  },
  {
    key: "serviceMail",
    label: "Boite fonctionnelle",
    options: {
      isSortable: false,
    },
  },
  {
    key: "custom-edit",
    label: "Action",
  },
];

const title = computed(
  () => `Liste des territoires (${territoireStore.total})`,
);

const sortableTitles = titles.flatMap((t) =>
  t.options?.isSortable ? [t.key] : [],
);

const label = ref(query.label ?? "");
const limit = ref(parseInt(query.limit, 10) || 10);
const offset = ref(parseInt(query.offset, 10) || 0);
const sort = ref(sortableTitles.includes(query.sort) ? query.sort : "");
const sortDirection = ref(
  ["", "ASC", "DESC"].includes(query.sortDirection) ? query.sortDirection : "",
);

const isValidParams = (params) =>
  params !== undefined &&
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);

let timeout = null;

const updateData = () => {
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
    navigateTo({
      query: {
        limit: limit.value,
        offset: offset.value,
        ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
        ...(isValidParams(sortDirection.value)
          ? { sortDirection: sortDirection.value }
          : {}),
        ...(isValidParams(label.value) ? { label: label.value } : {}),
      },
    });
  }, 300);
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});

updateData();

// actions
const navigate = (state) => {
  navigateTo({
    path: `/territoires/${state.territoireId}`,
  });
};
</script>
