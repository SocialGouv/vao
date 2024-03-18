<template>
  <div class="fr-container">
    <h1 class="header">
      Liste des comptes ({{ usersStore.total }})
    </h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <fieldset class="fr-fieldset">
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
                  label="Courriel"
                  placeholder="Courriel"
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
            <div class="fr-toggle">
                <input type="checkbox" 
                  class="fr-toggle__input" 
                  aria-describedby="toggle-valide" 
                  v-model="searchState.valide"
                  id="toggle-valide">
                <label 
                  class="fr-toggle__label" 
                  for="toggle-valide" 
                  data-fr-checked-label="Activé" 
                  data-fr-unchecked-label="Désactivé">Compte validé</label>
                <p class="fr-hint-text" id="toggle-valide">Compte validé par courriel</p>
            </div>            

          </fieldset>
          <!--<DsfrButton @click.prevent="test">Test</DsfrButton
            >
          -->
        </form>
      </div>
    </div>
    <UtilsTable
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
    ></UtilsTable>
  </div>
</template>

<script setup>
import { useUserStore } from "~/stores/user";

const usersStore = useUserStore();

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const config = useRuntimeConfig();

const log = logger("pages/comptes");



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
});

// Appel du store à l'ouverture
usersStore.fetchUsers({ limit: defaultLimit, offset: defaultOffset,search: searchState });


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

const onStatutSelect = (value) => {
  if (value === "Tous les statuts") {
    searchState.statut = null;
  } else {
    searchState.statut = value;
  }
};

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
    text: "Courriel",
    sort: true,
  },
  {
    column: "territoire",
    text: "Territoire",
    sort: true,
  }
  ,
  {
    column: "valide",
    text: "Compte validé",
    type: "checkbox",
    sort: true,
  }
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
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
