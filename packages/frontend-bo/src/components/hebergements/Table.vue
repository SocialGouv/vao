<template>
  <HebergementsFilters
    v-model:search="search"
    :is-export-available="props.total > 0"
    @get-csv="emits('get-csv')"
    @filters-update="updateData"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :columns="props.columns"
    :table-title="props.title"
    :data="props.data"
    :total="props.total"
    row-id="declarationId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-dateSejour="{ cell }">
      {{ displayDate(cell) }}
    </template>
    <template #cell-telephone="{ cell }">
      {{ displayPhone(cell) }}
    </template>
    <template #cell-dateVisite="{ cell }">
      {{ displayDate(cell) }}
    </template>
    <template #cell-reglementationErp="{ cell }">
      {{ cell ? "Oui" : "Non" }}
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="props.redirection(row)"
        title="Naviguer vers la demande séjour"
        class="no-background-image"
      >
        <DsfrButton
          class="link__dsfrButton"
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
import dayjs from "dayjs";
import {
  DsfrDataTableV2Wrapper,
  usePagination,
  isValidParams,
} from "@vao/shared";

const props = defineProps({
  title: { type: String, required: true },
  columns: { type: Array, required: true },
  data: { type: Array, required: true },
  total: { type: Number, required: true },
  action: { type: Function, required: true },
  redirection: { type: Function, required: true },
});

const emits = defineEmits(["get-csv"]);

const route = useRoute();

const search = ref(route.query.search ?? "");

const sortableColumns = props.columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const { limit, offset, sort, sortDirection } = usePagination(
  route.query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(search.value) ? { search: search.value } : {}),
});

const fetchData = async () => {
  const query = {
    limit: limit.value,
    offset: offset.value,
    ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
    ...(isValidParams(sortDirection.value)
      ? { sortDirection: sortDirection.value.toUpperCase() }
      : {}),
    ...getSearchParams(),
  };
  await props.action(query);
  navigateTo(query);
};

const updateData = useSetDebounce(fetchData, 300);

fetchData();

const displayPhone = (phone) => phone.replace(/(\d{2})(?=\d)/g, "$1 ");
const displayDate = (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "");
</script>
