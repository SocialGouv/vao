<template>
  <div class="fr-container">
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
      :data="hebergements"
      :total-items="count"
      :current-page="page"
      :sort-by="sortBy"
      :sort-direction="sortDirection"
      :items-by-page="limit"
      @update-sort="handleHupdateSort"
      @update-items-by-page="handleUpdateItemsByPage"
      @update-current-page="handleUpdateCurrentPage"
    />
  </div>
</template>

<script setup>
import { formatDate } from "date-fns";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const demandeSejourStore = useDemandeSejourStore();

const headers = [
  {
    column: "nom",
    text: "Nom",
    sort: true,
  },
  {
    column: "date_sejour",
    text: "Date du séjour",
    sort: true,
  },
  {
    column: "departement",
    text: "Département",
    sort: true,
  },
  {
    column: "adresse",
    text: "Adresse",
    format: (row) => row.adresse.label,
  },
  {
    column: "telephone",
    text: "Téléphone",
    format: (row) => (row.telephone || "").replace(/(\d{2})(?=\d)/g, "$1 "),
  },
  {
    column: "email",
    text: "Courriel",
    sort: true,
  },
  {
    column: "date_visite",
    text: "Date dernière visite",
    sort: true,
    format: (row) =>
      row.date_visite ? formatDate(row.date_visite, "dd/MM/yyyy") : "",
  },
  {
    column: "reglementation_erp",
    text: "Réglementation erp",
    sort: true,
  },
];

const route = useRoute();
const search = ref(route.query.search ?? "");
const sortBy = ref(route.query.sort?.replace("-", "") ?? "nom");
const sortDirection = ref(route.query.sort?.includes("-") ? "DESC" : "ASC");
const limit = ref(parseInt(route.query.limit, 10) || 10);
const page = ref(
  Math.floor(route.query.offset / limit.value) || 0,
);

const sort = computed(
  () => `${sortDirection.value === "ASC" ? "" : "-"}${sortBy.value}`,
);

const refreshTable = () => {
  demandeSejourStore.getHebergements({
    search: search.value,
    sort: sort.value,
    limit: limit.value,
    offset: page.value * limit.value,
  });
};

const router = useRouter();
let timeout = null;
const updateUrl = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    router.replace({
      query: {
        search: search.value,
        sort: sort.value,
        limit: limit.value,
        offset: page.value * limit.value,
      },
    });
    refreshTable();
  }, 300);
};

const handleSearch = () => {
  page.value = 0;
  updateUrl();
};

const handleHupdateSort = (value) => {
  sortBy.value = value.sortBy;
  sortDirection.value = value.sortDirection;
  updateUrl();
};
const handleUpdateItemsByPage = (val) => {
  limit.value = val;
  page.value = 1;
  updateUrl();
};

const handleUpdateCurrentPage = (val) => {
  page.value = val;
  updateUrl();
};

refreshTable();

const count = computed(() => demandeSejourStore.hebergementsCount);
const hebergements = computed(() => demandeSejourStore.hebergements);
</script>
