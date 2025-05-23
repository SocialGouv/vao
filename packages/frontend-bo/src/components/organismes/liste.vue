<template>
  <OrganismesFilters
    v-model:name="name"
    v-model:region-obtention="regionObtention"
    v-model:siret="siret"
    v-model:year-obtention="yearObtention"
    @filters-update="updateData"
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
    row-id="organismeId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-name="{ row }">
      {{
        row.personne.nom
          ? row.personne.nom
          : row.personne?.raisonSociale || row.personne?.nomNaissance
      }}
    </template>
    <template #cell-typeOrganisme="{ cell }">
      {{
        cell === "personne_physique" ? "Personne physique" : "Personne morale"
      }}
    </template>
    <template #cell-complet="{ cell }">
      {{ cell ? "Oui" : "Non" }}
    </template>
    <template #cell-editedAt="{ cell }">
      {{ dayjs(cell).format("DD/MM/YYYY") }}
    </template>
    <template #cell-siret="{ row }">
      {{ row.personne.siret }}
    </template>
    <template #cell-agrement:dateObtention="{ row }">
      {{
        row.agrement?.dateObtention
          ? dayjs(row.agrement?.dateObtention).format("DD/MM/YYYY")
          : ""
      }}
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="`/organismes/${row.organismeId}`"
        title="Naviguer vers l'organisme"
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
import {
  DsfrDataTableV2Wrapper,
  isValidParams,
  usePagination,
} from "@vao/shared";
import dayjs from "dayjs";

const organismeStore = useOrganismeStore();
const route = useRoute();

const data = computed(() => organismeStore.organismes);
const total = computed(() => organismeStore.organismesTotal);

const { query } = route;

const columns = [
  {
    key: "name",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "typeOrganisme",
    label: "Type",
    options: {
      isSortable: true,
    },
  },
  {
    key: "editedAt",
    label: "Date de modification",
    options: {
      isSortable: true,
    },
  },
  {
    key: "complet",
    label: "Complet",
    options: {
      isSortable: true,
    },
  },
  {
    key: "siret",
    label: "Siret",
    options: {
      isSortable: true,
    },
  },
  {
    key: "agrement:regionObtention",
    label: "Région agrément",
    options: {
      isSortable: true,
    },
  },
  {
    key: "agrement:dateObtention",
    label: "Date agrément",
    options: {
      isSortable: true,
    },
  },
  {
    key: "sejourCount",
    label: "séjours",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom:edit",
    label: "Action",
    options: {
      isFixedRight: true,
    },
  },
];

const title = "Liste des Organismes";

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const name = ref(query.name ?? "");
const regionObtention = ref(query["agrement:regionObtention"] ?? "");
const siret = ref(query.siret ?? "");
const yearObtention = ref(query["agrement:dateObtention"] ?? "");

const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(name.value) ? { name: name.value } : {}),
  ...(isValidParams(regionObtention.value)
    ? { "agrement:regionObtention": regionObtention.value }
    : {}),
  ...(isValidParams(siret.value) ? { siret: siret.value } : {}),
  ...(isValidParams(yearObtention.value)
    ? { "agrement:dateObtention": yearObtention.value }
    : {}),
});

let timeout = null;

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

    organismeStore.fetchOrganismes(query);
    navigateTo({ query });
  }, 300);
};

updateData();

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
