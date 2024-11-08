<template>
  <div class="fr-container">
    <h1 class="header">Liste des agents de l’Etat ({{ usersStore.total }})</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <DsfrButton class="fr-mb-2v" @click.prevent="createUser">
            Créer un nouvel utilisateur
          </DsfrButton>
          <div class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.nom"
                  type="text"
                  name="nom"
                  label="Nom"
                  placeholder="Nom"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.prenom"
                  type="text"
                  name="prenom"
                  label="Prénom"
                  placeholder="Prénom"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.email"
                  type="mail"
                  name="mail"
                  label="Adresse courriel"
                  placeholder="Adresse courriel"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.territoire"
                  type="text"
                  name="territoire"
                  label="Territoire"
                  placeholder="Territoire"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  :model-value="searchState.statut"
                  label="Statut"
                  name="statut"
                  mode="tags"
                  searchable
                  :close-on-select="false"
                  :options="statutOptions"
                  @update:model-value="onSelectStatut"
                />
              </div>
            </div>
          </div>
          <div class="fr-input-group">
            <DsfrButton
              type="button"
              label="Extraire en CSV"
              primary
              @click="getCsv"
            />
          </div>
        </form>
      </div>
    </div>
    <TableWithBackendPagination
      :headers="headers"
      :data="usersStore.users"
      :total-items="usersStore.total"
      :current-page="currentPageState"
      :sort-by="sortState.sortBy"
      :sort-direction="sortState.sortDirection"
      :items-by-page="limitState"
      :on-click-cell="navigate"
      @update-sort="updateSort"
      @update-items-by-page="updateItemsByPage"
      @update-current-page="updateCurrentPage"
    />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});
import { useUserStore } from "~/stores/user";
import { TableWithBackendPagination } from "@vao/shared";

const usersStore = useUserStore();

const defaultLimit = 10;
const defaultOffset = 0;

const sortState = ref({});
const currentPageState = ref(defaultOffset);
const limitState = ref(defaultLimit);
const searchState = reactive({
  nom: null,
  prenom: null,
  territoire: null,
  email: null,
  actif: true,
  statut: null,
});

const statutOptions = [
  {
    text: "Tous",
    value: "tous",
  },
  {
    text: "Validés",
    value: "validated",
  },
  {
    text: "Non validés",
    value: "notValidated",
  },
  {
    text: "Désactivés",
    value: "deleted",
  },
];
const onSelectStatut = (statut) => {
  if (statut === "tous") {
    searchState.statut = null;
  } else {
    searchState.statut = statutOptions.find((so) => so.value === statut).value;
  }
};

// Appel du store à l'ouverture
usersStore.fetchUsers({
  limit: defaultLimit,
  offset: defaultOffset,
  search: searchState,
});

watch(
  [sortState, limitState, currentPageState],
  ([sortValue, limitValue, currentPageValue]) => {
    usersStore.fetchUsers({
      sortBy: sortValue.sortBy,
      sortDirection: sortValue.sortDirection,
      limit: limitValue,
      offset: currentPageValue * limitValue,
      search: searchState,
    });
  },
);

const fetchUsersDebounce = debounce((search) => {
  usersStore.fetchUsers({
    sortBy: sortState.value.sortBy,
    sortDirection: sortState.value.sortDirection,
    limit: limitState.value,
    offset: currentPageState.value * limitState.value,
    search,
  });
});

watch([searchState], ([searchValue]) => {
  fetchUsersDebounce(searchValue);
});

const navigate = (state) => {
  navigateTo(`/comptes/${state.id}`);
};

async function createUser() {
  return navigateTo("/comptes");
}

const headers = [
  {
    column: "nom",
    text: "Nom",
    sort: true,
  },
  {
    column: "prenom",
    text: "Prénom",
    sort: true,
  },
  {
    column: "email",
    text: "Adresse courriel",
    sort: true,
  },
  {
    column: "territoire",
    text: "Territoire",
    sort: true,
  },
  {
    column: "validated",
    text: "Compte validé",
    type: "checkbox",
    format: (value) => (value.validated ? "Oui" : "Non"),
    sort: true,
  },
  {
    column: "editable",
    text: "Modifiable",
    type: "icon",
    format: (value) => (value.editable ? "Oui" : "Non"),
    sort: true,
  },
];

const updateSort = ({ sortBy: sb, sortDirection: sd }) => {
  sortState.value = {
    sortBy: sb,
    sortDirection: sd,
  };
};
const updateItemsByPage = (val) => {
  limitState.value = parseInt(val);
};
const updateCurrentPage = (val) => {
  currentPageState.value = val;
};

const getCsv = async () => {
  const response = await usersStore.exportUsers();
  exportCsv(response, "users.csv");
};
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
