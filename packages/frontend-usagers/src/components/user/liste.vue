<template>
  <UserListeFilters
    v-model:email="email"
    v-model:nom="nom"
    v-model:prenom="prenom"
    v-model:statut="statut"
    :status-actions="statusUser.label"
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
    row-id="userId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-siegeSocial="{ cell }">
      {{ cell === true ? "Principal" : "Secondaire" }}
    </template>
    <template #cell-Adresse="{ cell }">
      {{ getCommuneCp(cell) }}
    </template>
    <template #cell-statut="{ cell }">
      <div>
        <UserStatusBadge :statut="cell" />
      </div>
    </template>
    <template #cell-custom:edit="{ row }">
      <NuxtLink
        :to="`/comptes/${row.userId}`"
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
  UserStatusBadge,
  statusUser,
} from "@vao/shared";

const userStore = useUserStore();
const route = useRoute();

const data = computed(() => userStore.users);
const total = computed(() => userStore.total);

const title = computed(() => `Liste des utilisateurs (${total.value})`);

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
    key: "telephone",
    label: "N° de téléphone",
    options: {
      isSortable: true,
    },
  },
  {
    key: "siegeSocial",
    label: "Organisme",
    options: {
      isSortable: true,
    },
  },
  {
    key: "Adresse",
    label: "Ville",
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
    key: "custom:edit",
    label: "Action",
  },
];

const { query } = route;

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const statusValue = statusUser.label.map(({ value }) => value);

const nom = ref(query.nom ?? "");
const prenom = ref(query.prenom ?? "");
const email = ref(query.email ?? "");
const statut = ref(statusValue.includes(query.statut) ? query.statut : "");
const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(nom.value) ? { nom: nom.value } : {}),
  ...(isValidParams(prenom.value) ? { prenom: prenom.value } : {}),
  ...(isValidParams(email.value) ? { email: email.value } : {}),
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

    userStore.fetchUsersOrganisme(query);
    navigateTo({ query });
  }, 300);
};

const getCommuneCp = (adresse) => {
  const decomposeAdresse = adresse.split(" ");
  const cpIndex = decomposeAdresse.findIndex((mot) =>
    regex.formatCommuneCP.test(mot),
  );
  return cpIndex > 0
    ? `${decomposeAdresse.slice(cpIndex + 1).join(" ")} (${decomposeAdresse[cpIndex]})`
    : null;
};
updateData();

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
