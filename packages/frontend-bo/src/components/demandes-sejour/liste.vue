<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <CardsNumber
          v-if="!props.organisme && props.display === displayType.Organisme"
          :values="cards"
          @click="onClickCards($event)"
        />
        <CardsNumber
          v-if="
            !props.organisme &&
            props.display === displayType.Messagerie &&
            userStore.user.serviceCompetent === 'DEP'
          "
          :values="[
            {
              title: 'Messages non lus',
              value: sejourStore.stats?.nonlu || 0,
            },
            {
              title: 'Messages lus',
              value: sejourStore.stats?.lu || 0,
            },
            {
              title: 'Messages répondus',
              value: sejourStore.stats?.repondu || 0,
            },
          ]"
        />
      </div>
      <div class="fr-col-12">
        <h1 v-if="props.display === displayType.Organisme" class="header">
          Liste des déclarations reçues
          {{ props.organisme ? "" : `(${sejourStore.stats?.global})` }}
        </h1>
        <form>
          <div class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
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
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
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
              v-if="props.display === displayType.Organisme"
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <DsfrMultiselect
                v-model="searchState.statuts"
                label="Statut"
                search
                select-all
                id-key="value"
                :options="status"
              />
            </div>
            <div
              v-if="!props.organisme && props.display === displayType.Organisme"
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  label="Actions à faire"
                  name="action"
                  mode="tags"
                  :options="[
                    { value: 'ALL', text: 'Toutes les déclarations' },
                    { value: 'A_TRAITER', text: 'Déclarations à traiter' },
                    { value: 'EN_ATTENTE', text: 'Déclarations en attente' },
                  ]"
                  @update:model-value="onSelectAction($event)"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div
                v-if="props.display === displayType.Organisme"
                class="fr-input-group"
              >
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
    <span class="number-of-ds"
      >{{ sejourStore.total }} déclarations affichées
    </span>
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
  MessageEtat,
  MessageHover,
  TableWithBackendPagination,
  ValidationModal,
} from "@vao/shared";
import { DsfrMultiselect } from "@gouvminint/vue-dsfr";
import dayjs from "dayjs";
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";
import Declaration from "~/components/demandes-sejour/Declaration.vue";
import "@vueform/multiselect/themes/default.css";
import { defineProps } from "vue";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const props = defineProps({
  organisme: { type: String, required: false, default: null },
  organismeId: { type: Number, required: false, default: null },
  display: { type: String, required: true },
});

const log = logger("pages/sejours");

const toaster = useToaster();

const sejourStore = useDemandeSejourStore();
const demandeSejour = useDemandeSejourStore();
const userStore = useUserStore();
const defaultSort = [];
const defaultLimit = 10;
const defaultOffset = 0;

const sortState = ref({});

const currentPageState = ref(defaultOffset);
const limitState = ref(defaultLimit);

const route = useRoute();

const displayType = { Messagerie: "Messagerie", Organisme: "Organisme" };

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
  organismeId: props.organismeId ?? null,
  statuts: route.query.statuts
    ? route.query.statuts
        .split(",")
        .filter((statut) => Object.values(status.value).includes(statut))
    : [],
  message: props.display === displayType.Messagerie,
});

watch(
  () => props.organisme,
  () => (searchState.organisme = props.organisme),
  { immediate: true },
);

const onSelectAction = (value) => {
  switch (value) {
    case "A_TRAITER":
      onStatutSelect([
        demandesSejours.statuts.TRANSMISE,
        demandesSejours.statuts.TRANSMISE_8J,
        demandesSejours.statuts.EN_COURS,
        demandesSejours.statuts.EN_COURS_8J,
      ]);
      break;
    case "EN_ATTENTE":
      onStatutSelect([
        demandesSejours.statuts.A_MODIFIER,
        demandesSejours.statuts.A_MODIFIER_8J,
        demandesSejours.statuts.ATTENTE_8_JOUR,
      ]);
      break;
    default:
      searchState.statuts = [];
  }
};

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

sejourStore.currentDemande = null;
try {
  await sejourStore.fetchDemandes({
    sortBy: defaultSort,
    limit: defaultLimit,
    offset: defaultOffset,
    search: searchParams.value,
  });
} catch (error) {
  toaster.error({
    titleTag: "h2",
    description: "Une erreur est survenue lors de la récupération des demandes",
  });
  throw error;
}

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
      throw error;
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
    throw error;
  }
});

watch(searchParams, (search) => {
  fetchDemandesDebounce(search);
});

const onStatutSelect = (value) => {
  if (value.length) {
    searchState.statuts = value;
  } else {
    searchState.statuts = null;
  }
};

const headersOrganisme = [
  {
    column: "idFonctionnelle",
    text: "Numéro de déclaration",
    sort: true,
  },
  {
    column: "libelle",
    text: "Nom de séjour",
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

const headersMessagerie = [
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
    column: "demandeSejourStatut",
    text: "Statut",
    component: ({ statut }) => ({
      component: DemandeStatusBadge,
      statut: statut,
    }),
  },
  {
    column: "demandeSejourOrganisme",
    text: "Organisme",
    format: (value) => demandesSejours.getOrganismeTitle(value),
  },
  {
    column: "dateDebut",
    text: "Dates (Début-fin)",
    format: (value) => demandesSejours.getDateDebutFin(value),
    sort: true,
  },
  {
    column: "messageCreatedAt",
    sorter: "messageCreatedAt",
    format: (value) =>
      value.messageLastAt
        ? dayjs(value.messageLastAt).format("DD/MM/YYYY HH:mm")
        : "",
    text: "Date dernier message",
  },
  {
    column: "message",
    text: "Dernier message",
    component: ({ message }) => ({
      component: MessageHover,
      content: message,
    }),
  },
  {
    column: "messageEtat",
    text: "Message",
    component: ({ messageEtat }) => ({
      component: MessageEtat,
      etat: messageEtat,
    }),
  },
];

const headers = computed(() =>
  props.display === displayType.Organisme
    ? headersOrganisme
    : headersMessagerie,
);

const nestedPage = computed(() =>
  props.display === displayType.Messagerie ? "messagerie" : "formulaire",
);

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
    navigateTo({
      path: `/sejours/${state.declarationId}/${nestedPage.value}`,
    });
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
    navigateTo({
      path: `/sejours/${declarationId}/${nestedPage.value}`,
    });
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
    });
    throw error;
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

const cards = computed(() => [
  {
    title: "Déclarations reçues à traiter",
    value: sejourStore.stats?.transmis || 0,
    clickable: true,
    onClick: () => onStatutSelect([demandesSejours.statuts.TRANSMISE]),
  },
  {
    title: "Déclarations en cours de traitement",
    value: sejourStore.stats?.enCours + sejourStore.stats?.enCours8J || 0,
    clickable: true,
    onClick: () =>
      onStatutSelect([
        demandesSejours.statuts.EN_COURS,
        demandesSejours.statuts.EN_COURS_8J,
      ]),
  },
  {
    title: "Déclarations 8 jours à traiter",
    value: sejourStore.stats?.transmis8J || 0,
    clickable: true,
    onClick: () => onStatutSelect([demandesSejours.statuts.TRANSMISE_8J]),
  },
]);

const onClickCards = (title) => {
  cards.value.find((c) => c.title === title)?.onClick();
};

onMounted(async () => {
  if (props.display === displayType.Messagerie)
    sortState.value = {
      sortBy: "messageOrdreEtat",
      sortDirection: "ASC",
    };
});
</script>

<style scoped>
.header {
  padding: 1em 0em;
}

.number-of-ds {
  font-weight: bold;
  font-style: italic;
  font-size: 1.25rem;
}
</style>
