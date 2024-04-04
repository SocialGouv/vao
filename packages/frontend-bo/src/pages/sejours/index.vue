<template>
  <div class="fr-container">
    <h1 class="header">Liste des séjours déclarés ({{ sejourStore.total }})</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.libelle"
                  type="text"
                  name="libelle"
                  label="Nom du séjour"
                  placeholder="Nom du séjour"
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
                  type="text"
                  name="organisme"
                  label="Organisme"
                  placeholder="Organisme"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <label class="fr-label"> Statut </label>
                <DsfrSelect
                  :model-value="searchState.statut"
                  name="status"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="[
                    'Tous les statuts',
                    ...Object.values(demandesSejours.statuts),
                  ]"
                  @update:model-value="onStatutSelect"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <label class="fr-label"> Action </label>
                <DsfrSelect
                  :model-value="searchState.estInstructeurPrincipal"
                  name="action"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="[
                    'Tous les statuts',
                    'A instruire',
                    'Lecture seule',
                  ]"
                  @update:model-value="onActionSelect"
                />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
    <UtilsTable
      :headers="headers"
      :data="sejourStore.demandes"
      :total-items="sejourStore.total"
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
definePageMeta({
  middleware: ["is-connected", "check-role"],
  role: "DemandeSejour",
});

import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";
import Declaration from "~/components/demandes-sejour/Declaration.vue";

const sejourStore = useDemandeSejourStore();

const defaultLimit = 10;
const defaultOffset = 0;

const sortState = ref({});
const currentPageState = ref(defaultOffset);
const limitState = ref(defaultLimit);
const searchState = reactive({
  libelle: null,
  organisme: null,
  statut: null,
});

sejourStore.currentDemande = null;
sejourStore.fetchDemandes({
  limit: defaultLimit,
  offset: defaultOffset,
});

watch(
  [sortState, limitState, currentPageState],
  ([sortValue, limitValue, currentPageValue]) => {
    sejourStore.fetchDemandes({
      sortBy: sortValue.sortBy,
      sortDirection: sortValue.sortDirection,
      limit: limitValue,
      offset: currentPageValue * limitValue,
      search: searchState,
    });
  },
);

const fetchDemandesDebounce = debounce((search) => {
  sejourStore.fetchDemandes({
    sortBy: sortState.value.sortBy,
    sortDirection: sortState.value.sortDirection,
    limit: limitState.value,
    offset: currentPageState.value * limitState.value,
    search,
  });
});

watch([searchState], ([searchValue]) => {
  fetchDemandesDebounce(searchValue);
});

const onStatutSelect = (value) => {
  if (value === "Tous les statuts") {
    searchState.statut = null;
  } else {
    searchState.statut = value;
  }
};

const onActionSelect = (value) => {
  if (value === "Tous les statuts") {
    searchState.estInstructeurPrincipal = null;
  } else {
    searchState.estInstructeurPrincipal = value === "A instruire";
  }
};

const headers = [
  {
    column: "libelle",
    text: "Libelle",
    sort: true,
  },
  {
    column: "dateDebut",
    text: "Dates (Début-fin)",
    format: (value) => demandesSejours.getDateDebutFin(value),
    sort: true,
  },
  {
    column: "demandeSejourSaison",
    text: "Saison",
    format: (value) => demandesSejours.getSaison(value),
  },
  {
    column: "demandeSejourOrganisme",
    text: "Organisme",
    format: (value) => demandesSejours.getOrganismeTitle(value),
  },
  {
    column: "demandeSejourDeclaration",
    text: "Declaration",
    component: ({ statut }) => ({
      component: Declaration,
      statut: statut,
    }),
  },
  {
    column: "demandeSejourStatut",
    text: "Statut",
    component: ({ statut }) => ({
      component: DemandeStatusBadge,
      statut: statut,
    }),
  },
  {
    column: "estInstructeurPrincipal",
    text: "Action",
    format: (value) =>
      value.estInstructeurPrincipal ? "A instruire" : "Lecture seule",
    sort: true,
  },
];
const navigate = (state) => {
  navigateTo(`/sejours/${state.demandeSejourId}`);
};

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
