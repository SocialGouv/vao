<template>
  <DemandesSejourListByMessageFilters
    v-model:id-fonctionnelle="idFonctionnelle"
    v-model:organisme="organisme"
    v-model:libelle="libelle"
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
    row-id="declarationId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-organisme="{ row }">
      {{ row.organismeAgree?.raisonSociale }}
    </template>
    <template #cell-statut="{ cell }">
      <DemandeStatusBadge :statut="cell" type="bo" />
    </template>
    <template #cell-dateDebut="{ row }">
      {{ displayDate(row.dateDebut) }} -<br />{{ displayDate(row.dateFin) }}
    </template>
    <template #cell-messageLastAt="{ cell }">
      {{ displayDateHours(cell) }}
    </template>
    <template #cell-message="{ cell }">
      <span> <MessageHover v-if="cell" :content="cell" /> </span>
    </template>
    <template #cell-messageEtat="{ row, cell }">
      <MessageEtat :message="row.message" :etat="cell" />
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="`/sejours/${row.declarationId}/messagerie`"
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
import {
  MessageHover,
  MessageEtat,
  DemandeStatusBadge,
  DsfrDataTableV2Wrapper,
  usePagination,
  isValidParams,
} from "@vao/shared";
import dayjs from "dayjs";

const demandeSejourStore = useDemandeSejourStore();
const route = useRoute();
const { query } = route;
const data = computed(() => demandeSejourStore.declarationsMessages);
const total = computed(() => demandeSejourStore.declarationsMessagesTotal);

const columns = [
  {
    key: "idFonctionnelle",
    label: "Numéro de déclaration",
    options: {
      isSortable: true,
    },
  },
  {
    key: "libelle",
    label: "Nom du séjour",
    options: {
      isSortable: true,
    },
  },
  {
    key: "statut",
    label: "Statut",
    options: {
      isSortable: true,
    },
  },
  {
    key: "organisme",
    label: "Organisme",
  },
  {
    key: "dateDebut",
    label: "Dates (Début-fin)",
    options: {
      isSortable: true,
    },
  },
  {
    key: "messageLastAt",
    label: "Date dernier message",
  },
  {
    key: "message",
    label: "Dernier message",
  },
  {
    key: "messageEtat",
    label: "Message",
  },
  {
    key: "custom:edit",
    label: "Action",
    options: {
      isFixedRight: true,
    },
  },
];

const title = computed(
  () =>
    `Liste des déclarations (${demandeSejourStore.declarationsMessagesTotal})`,
);

const displayDate = (date) => dayjs(date).format("DD/MM/YYYY");
const displayDateHours = (date) =>
  date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "";

const idFonctionnelle = ref(query.idFonctionnelle ?? "");
const libelle = ref(query.libelle ?? "");
const organismeId = ref(query.organismeId ?? "");
const organisme = ref(query.organisme ?? "");

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(idFonctionnelle.value)
    ? { idFonctionnelle: idFonctionnelle.value }
    : {}),
  ...(isValidParams(libelle.value) ? { libelle: libelle.value } : {}),
  ...(isValidParams(organisme.value) ? { organisme: organisme.value } : {}),
});

const fetchData = () => {
  const query = {
    limit: limit.value,
    offset: offset.value,
    ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
    ...(isValidParams(sortDirection.value)
      ? { sortDirection: sortDirection.value.toUpperCase() }
      : {}),
    ...getSearchParams(),
    ...(isValidParams(organismeId.value)
      ? { organismeId: organismeId.value }
      : {}),
  };
  demandeSejourStore.fetchDeclarationsMessages(query);
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
};

const updateData = useSetDebounce(fetchData, 300);

fetchData();
</script>
