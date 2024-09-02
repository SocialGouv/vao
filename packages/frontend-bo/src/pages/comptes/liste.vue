<template>
  <div class="fr-container">
    <h1 class="header">Liste des comptes ({{ usersStore.total }})</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <DsfrButton @click.prevent="createUser"
            >Créer un nouvel utilisateur
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
          </div>
          <div class="fr-fieldset">
            <div class="fr-toggle">
              <input
                id="toggle-valide"
                v-model="searchState.valide"
                type="checkbox"
                class="fr-toggle__input"
                aria-describedby="toggle-valide"
              />
              <label
                class="fr-toggle__label"
                for="toggle-valide"
                data-fr-checked-label="Activé"
                data-fr-unchecked-label="Désactivé"
                >Compte validé</label
              >
              <p id="toggle-valide" class="fr-hint-text">
                Compte validé par courriel
              </p>
            </div>
            <div class="fr-toggle">
              <input
                id="toggle-actif"
                v-model="searchState.actif"
                type="checkbox"
                class="fr-toggle__input"
                aria-describedby="toggle-actif"
              />
              <label
                class="fr-toggle__label"
                for="toggle-actif"
                data-fr-checked-label="Activé"
                data-fr-unchecked-label="Désactivé"
                >Compte actif</label
              >
              <p id="toggle-actif" class="fr-hint-text">Compte actif</p>
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
    <TableWithPagination
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
import { TableWithPagination } from "@vao/shared";

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
  valide: true,
  email: null,
  actif: true,
});

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
    column: "valide",
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
