<template>
  <UserListeFilters
    v-model:email="email"
    v-model:nom="nom"
    v-model:prenom="prenom"
    v-model:statut="statut"
    v-model:territoire="territoire"
    :status-actions="status"
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
    <template #cell-validated="{ cell }">
      {{ cell ? "Oui" : "Non" }}
    </template>
    <template #cell-editable="{ cell }">
      {{ cell ? "Oui" : "Non" }}
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="`/comptes/${row.id}`"
        title="Naviguer vers le compte"
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
  usePagination,
  isValidParams,
} from "@vao/shared";

const userStore = useUserStore();
const route = useRoute();

const data = computed(() => userStore.users);
const total = computed(() => userStore.total);

const title = computed(() => `Liste des agents de l’État (${total.value})`);

const columns = [
  {
    key: "nom",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "prenom",
    label: "Prénom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "email",
    label: "Adresse courriel",
    options: {
      isSortable: true,
    },
  },
  {
    key: "territoire",
    label: "Territoire",
    options: {
      isSortable: true,
    },
  },
  {
    key: "validated",
    label: "Compte validé",
    options: {
      isSortable: true,
    },
  },
  {
    key: "editable",
    label: "Modifiable",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom:edit",
    label: "Action",
  },
];

const { query } = route;

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const status = [
  {
    value: "",
    text: "Tous",
  },
  {
    value: "valied",
    text: "Validés",
  },
  {
    value: "notValided",
    text: "Non validés",
  },
  {
    value: "disabled",
    text: "Désactivés",
  },
];

const statusValue = status.map(({ value }) => value);

const nom = ref(query.nom ?? "");
const prenom = ref(query.prenom ?? "");
const email = ref(query.email ?? "");
const territoire = ref(query.territoire ?? "");
const statut = ref(statusValue.includes(query.statut) ? query.statut : "");
const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(nom.value) ? { nom: nom.value } : {}),
  ...(isValidParams(prenom.value) ? { prenom: prenom.value } : {}),
  ...(isValidParams(email.value) ? { email: email.value } : {}),
  ...(isValidParams(territoire.value) ? { territoire: territoire.value } : {}),
  ...(isValidParams(statut.value) ? { statut: statut.value } : {}),
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

    userStore.fetchUsers(query);
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
