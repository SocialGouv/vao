<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des comptes ({{ usersStore.totalUsersFO }})</h1>
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
                  v-model="searchState.organisme"
                  type="organisme"
                  name="organisme"
                  label="Organisme"
                  placeholder="Organisme"
                  :label-visible="true"
                />
              </div>
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
      :data="usersStore.usersFO"
      :total-items="usersStore.totalUsersFO"
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
import dayjs from "dayjs";

definePageMeta({
  middleware: ["is-connected"],
});

const usersStore = useUserStore();
const defaultLimit = 10;
const defaultOffset = 0;
const sortState = ref({});
const currentPageState = ref(defaultOffset);
const limitState = ref(defaultLimit);
const searchState = reactive({
  nom: null,
  prenom: null,
  email: null,
  organisme: null,
});
// Appel du store à l'ouverture
usersStore.fetchUsersOrganisme({
  limit: defaultLimit,
  offset: defaultOffset,
  search: searchState,
});
watch(
  [sortState, limitState, currentPageState],
  ([sortValue, limitValue, currentPageValue]) => {
    usersStore.fetchUsersOrganisme({
      sortBy: sortValue.sortBy,
      sortDirection: sortValue.sortDirection,
      limit: limitValue,
      offset: currentPageValue * limitValue,
      search: searchState,
    });
  },
);
const fetchUsersDebounce = debounce((search) => {
  usersStore.fetchUsersOrganisme({
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
    column: "statut",
    text: "Statut",
    format: (u) => {
      return (
        {
          VALIDATED: "Validé",
          NEED_EMAIL_VALIDATION: "En attente activation",
          BLOCKED: "Bloqué",
        }[u.statut] || "Statut inattendu"
      );
    },
    sort: true,
  },
  {
    column: "dateCreation",
    text: "Date de création",
    format: (u) => dayjs(u.dateCreation).format("DD/MM/YYYY HH:MM"),
    sort: true,
  },
  {
    column: "raisonSociale",
    text: "Raison sociale",
    sort: true,
  },
  {
    column: "nombreDeclarations",
    text: "Déclarations de séjour",
    sort: true,
  },
];
const updateSort = ({ sortBy, sortDirection }) => {
  sortState.value = {
    sortBy,
    sortDirection,
  };
};
const navigate = (organisme) => {
  navigateTo(`/organismes/${organisme.organismeId}`);
};
const updateItemsByPage = (val) => {
  limitState.value = parseInt(val);
};
const updateCurrentPage = (val) => {
  currentPageState.value = val;
};
</script>
