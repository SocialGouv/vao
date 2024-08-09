<template>
  <h1>Hebergements ({{ count }})</h1>
  <div class="fr-col-12">
    <fieldset class="fr-fieldset">
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
      >
        <div class="fr-input-group">
          <DsfrInputGroup
            v-model="search"
            type="text"
            name="libelle"
            label="Recherche"
            placeholder="Recherche"
            :label-visible="true"
            @update:model-value="handleSearch"
          />
        </div>
      </div>
    </fieldset>
  </div>
  <UtilsTable
    :headers="headers"
    :data="data"
    :total-items="count"
    :current-page="page"
    :sort-by="sortBy"
    :sort-direction="sortDirection"
    :items-by-page="limit"
    :on-click-cell="(row) => emits('click-on-cell', row)"
    @update-sort="handleHupdateSort"
    @update-items-by-page="handleUpdateItemsByPage"
    @update-current-page="handleUpdateCurrentPage"
  />
</template>

<script setup>
const props = defineProps({
  headers: { type: Array, required: true },
  data: { type: Array, required: true },
  count: { type: Number, required: true },
  action: { type: Function, required: true },
  isUrlUpdate: { type: Boolean, default: false },
});

const emits = defineEmits(["click-on-cell"]);

const route = useRoute();

const search = ref(route.query.search ?? "");
const sortBy = ref(route.query.sort?.replace("-", "") ?? "nom");
const sortDirection = ref(route.query.sort?.includes("-") ? "DESC" : "ASC");
const limit = ref(parseInt(route.query.limit, 10) || 10);
const page = ref(Math.floor(route.query.offset / limit.value) || 0);

const sort = computed(
  () => `${sortDirection.value === "ASC" ? "" : "-"}${sortBy.value}`,
);

const refreshTable = () => {
  props.action({
    search: search.value,
    sort: sort.value,
    limit: limit.value,
    offset: page.value * limit.value,
  });
};

const router = useRouter();

const refresqueryParams = () => {
  if (props.isUrlUpdate) {
    navigateTo({
      replace: true,
      query: {
        search: search.value,
        sort: sort.value,
        limit: limit.value,
        offset: page.value * limit.value,
      },
    });
  }
  refreshTable();
};

const fetchDataandUrl = debounce(refresqueryParams, 300);

const handleSearch = () => {
  page.value = 0;
  fetchDataandUrl();
};

const handleHupdateSort = (value) => {
  sortBy.value = value.sortBy;
  sortDirection.value = value.sortDirection;
  fetchDataandUrl();
};
const handleUpdateItemsByPage = (val) => {
  limit.value = val;
  page.value = 1;
  fetchDataandUrl();
};

const handleUpdateCurrentPage = (val) => {
  page.value = val;
  fetchDataandUrl();
};

defineExpose({
  refreshTable,
});

refreshTable();
</script>
