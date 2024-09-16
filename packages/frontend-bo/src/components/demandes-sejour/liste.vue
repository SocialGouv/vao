<template>
  <div class="fr-container">
    <h1 class="header">
      Liste des séjours déclarés
      {{ props.organisme ? "" : `(${sejourStore.stats?.global})` }}
    </h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <CardsNumber
          v-if="!props.organisme"
          :values="[
            {
              title: 'Déclarations transmises à traiter',
              value: sejourStore.stats?.transmis || 0,
            },
            {
              title: 'Déclarations en cours de traitement',
              value: sejourStore.stats?.enCours || 0,
            },
            {
              title: 'Déclarations 8 jours à traiter',
              value: sejourStore.stats?.transmis8J || 0,
            },
          ]"
        />
      </div>
      <div class="fr-col-12">
        <form>
          <div class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.idFonctionnelle"
                  type="text"
                  name="libelle"
                  label="Numéro de déclaration"
                  placeholder="Numéro de déclaration"
                  :label-visible="true"
                />
              </div>
            </div>
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
              v-if="!props.organisme"
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
                <Multiselect
                  :model-value="searchState.statuts"
                  :hide-selected="true"
                  :searchable="true"
                  :close-on-select="false"
                  mode="tags"
                  name="statut"
                  :options="status"
                  @update:model-value="onStatutSelect"
                >
                  <template #option="{ option, isPointed }">
                    <MultiSelectOption
                      :label="`${option.label}`"
                      :is-pointed="isPointed(option)"
                    />
                  </template>
                  <template #no-result> Pas de résultat</template>
                </Multiselect>
              </div>
            </div>
            <div
              v-if="!props.organisme"
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  v-model="needAction"
                  label="Filtrer sur les séjours nécessitant une action"
                  name="action"
                  mode="tags"
                  :options="['Oui', 'Non']"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrButton
                  v-if="!props.organisme"
                  type="button"
                  label="Extraire en CSV"
                  primary
                  @click="getCsv"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <TableWithBackendPagination
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
    />
    <ValidationModal
      modal-ref="modal"
      name="prend-en-charge"
      :opened="declarationAPrendreEnCharge != null"
      title="Prise en charge d'une déclaration de séjour"
      :on-close="closePrendEnChargeModal"
      :on-validate="validatePriseEnCharge"
      validation-label="Valider la prise en charge"
      >Vous vous apprêtez à prendre en charge la déclaration du séjour : <br />
      - {{ declarationAPrendreEnCharge.libelle }}
    </ValidationModal>
  </div>
</template>

<script setup>
import {
  CardsNumber,
  MultiSelectOption,
  TableWithBackendPagination,
  ValidationModal,
} from "@vao/shared";
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";
import Declaration from "~/components/demandes-sejour/Declaration.vue";
import Multiselect from "@vueform/multiselect";
import "@vueform/multiselect/themes/default.css";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const props = defineProps({
  organisme: { type: String, required: false, default: null },
});

const log = logger("pages/sejours");

const toaster = useToaster();

const sejourStore = useDemandeSejourStore();
const demandeSejour = useDemandeSejourStore();
const userStore = useUserStore();

const defaultLimit = 10;
const defaultOffset = 0;

const sortState = ref({});
const currentPageState = ref(defaultOffset);
const limitState = ref(defaultLimit);

const route = useRoute();

const parseBoolean = (value) => value === "true";

const status = computed(() => [
  demandesSejours.statuts.TRANSMISE,
  demandesSejours.statuts.EN_COURS,
  demandesSejours.statuts.A_MODIFIER,
  demandesSejours.statuts.REFUSEE,
  demandesSejours.statuts.ATTENTE_8_JOUR,
  demandesSejours.statuts.TRANSMISE_8J,
  demandesSejours.statuts.EN_COURS_8J,
  demandesSejours.statuts.A_MODIFIER_8J,
  demandesSejours.statuts.REFUSEE_8J,
  demandesSejours.statuts.VALIDEE_8J,
  demandesSejours.statuts.SEJOUR_EN_COURS,
  demandesSejours.statuts.TERMINEE,
  demandesSejours.statuts.ANNULEE,
  demandesSejours.statuts.ABANDONNEE,
]);

const searchState = reactive({
  libelle: route.query.libelle,
  idFonctionnelle: route.query.idFonctionnelle,
  organisme: props.organisme ?? route.query.organisme,
  statuts: route.query.statuts
    ? route.query.statuts
        .split(",")
        .filter((statut) => Object.values(status.value).includes(statut))
    : null,
  action: parseBoolean(route.query.action),
});

watch(
  () => props.organisme,
  () => (searchState.organisme = props.organisme),
  { immediate: true },
);

const needAction = computed({
  get() {
    return searchState.action ? "Oui" : "Non";
  },
  set(value) {
    searchState.action = value === "Oui" ? true : false;
  },
});

const searchParams = computed(() =>
  Object.entries(searchState).reduce((acc, [key, value]) => {
    if (
      value !== null &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0)
    ) {
      acc[key] = Array.isArray(value) ? value.join(",") : value;
    }
    return acc;
  }, {}),
);

watch(
  [sortState, limitState, currentPageState],
  async ([sortValue, limitValue, currentPageValue]) => {
    try {
      await sejourStore.fetchDemandes({
        sortBy: sortValue.sortBy,
        sortDirection: sortValue.sortDirection,
        limit: limitValue,
        offset: currentPageValue * limitValue,
        search: searchParams.value,
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description:
          "Une erreur est survenue lors de la récupération de la demande",
      });
    }
  },
);

const fetchDemandesDebounce = debounce(async (search) => {
  navigateTo({ replace: true, query: search });
  try {
    await sejourStore.fetchDemandes({
      sortBy: sortState.value.sortBy,
      sortDirection: sortState.value.sortDirection,
      limit: limitState.value,
      offset: currentPageState.value * limitState.value,
      search,
    });
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        "Une erreur est survenue lors de la récupération de la demande",
    });
  }
});

watch(
  searchParams,
  (search) => {
    fetchDemandesDebounce(search);
  },
  { immediate: true },
);

const onStatutSelect = (value) => {
  if (value.length) {
    searchState.statuts = value;
  } else {
    searchState.statuts = null;
  }
};

const headers = [
  {
    column: "idFonctionnelle",
    text: "Numéro de déclaration",
    sort: true,
  },
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
];

const declarationAPrendreEnCharge = ref(null);

const closePrendEnChargeModal = () =>
  (declarationAPrendreEnCharge.value = null);
const navigate = (state) => {
  if (
    userStore.user?.roles &&
    userStore.user?.roles.includes("DemandeSejour_Ecriture") &&
    (state.statut === demandesSejours.statuts.TRANSMISE ||
      state.statut === demandesSejours.statuts.TRANSMISE_8J) &&
    state.estInstructeurPrincipal
  ) {
    declarationAPrendreEnCharge.value = state;
  } else {
    navigateTo(`/sejours/${state.declarationId}`);
  }
};
const validatePriseEnCharge = async () => {
  const declarationId = declarationAPrendreEnCharge.value.declarationId;
  try {
    await $fetchBackend(`/sejour/admin/${declarationId}/prise-en-charge`, {
      method: "POST",
      credentials: "include",
    });
    declarationAPrendreEnCharge.value = null;
    navigateTo(`/sejours/${declarationId}`);
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
    });
  }
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

const getCsv = async () => {
  const response = await demandeSejour.exportSejours();
  exportCsv(response, "sejours.csv");
};
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
