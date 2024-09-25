<template>
  <div class="fr-container fr-pt-8v">
    <h1>Liste des événements indésirables et graves (EIG)</h1>
    <div class="fr-grid-row">
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
                  name="Déclaration"
                  label="Déclaration"
                  placeholder="Déclaration"
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
                <DsfrInputGroup
                  v-model="searchState.libelle"
                  type="text"
                  name="Séjour"
                  label="Séjour"
                  placeholder="Séjour"
                  :label-visible="true"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  :model-value="searchState.departement"
                  label="Territoire"
                  name="Territoire"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="departement"
                  @update:model-value="onSelect($event, 'departement')"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrSelect
                  :model-value="searchState.type"
                  label="Type d'événement"
                  name="type"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="typesOption"
                  @update:model-value="onSelect($event, 'type')"
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
                  name="status"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="status"
                  @update:model-value="onSelect($event, 'statut')"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <RangeDatePicker
                v-model="searchState.dateRange"
                label="Date de l'eig"
              />
            </div>
          </div>
        </form>
      </div>
    </div>
    <TableWithBackendPagination
      :headers="headers"
      :data="eigStore.eigs ?? []"
      :total-items="eigStore.total"
      :current-page="currentPageState"
      :sort-by="sortState.sortBy"
      :sort-direction="sortState.sortDirection"
      :items-by-page="limitState"
      :on-click-cell="openModal"
      @update-sort="updateSort"
      @update-items-by-page="updateItemsByPage"
      @update-current-page="updateCurrentPage"
    />
    <ValidationModal
      modal-ref="modal-eig-list-consult"
      name="consult-eig"
      :opened="eigIdToRead != null"
      title="Consultation d’un EIG"
      :on-close="closeEigModal"
      :on-validate="() => readEig(eigIdToRead)"
      >Vous vous apprêtez à consulter un Evènement Indésirable Grave. Cette
      consultation enverra un email de notification à l’organisme.
    </ValidationModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import {
  eigModel,
  EigStatusBadge,
  EigTypeListe,
  RangeDatePicker,
  TableWithBackendPagination,
  ValidationModal,
} from "@vao/shared";
import { mapEigToLabel } from "@vao/shared/src/utils/eigUtils";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const departementStore = useDepartementStore();
const usersStore = useUserStore();
const eigStore = useEigStore();

const toaster = useToaster();

const defaultLimit = 10;
const defaultOffset = 0;

const allStatus = "Tous les statuts";
const sortState = ref({});
const currentPageState = ref(defaultOffset);
const limitState = ref(defaultLimit);
const searchState = reactive({
  libelle: null,
  statut: null,
  idFonctionnelle: null,
  type: null,
  organisme: null,
  departement: null,
  dateRange: null,
});

try {
  await eigStore.get({
    limit: defaultLimit,
    offset: defaultOffset,
    search: searchState,
  });
  await departementStore.fetch();
} catch (error) {
  toaster.error("Une erreur est survenue lors de la récupération des demandes");
  throw error;
}

const paginateResults = async (sortValue, limitValue, currentPageValue) => {
  try {
    await eigStore.get({
      sortBy: sortValue.sortBy,
      sortDirection: sortValue.sortDirection,
      limit: limitValue,
      offset: currentPageValue * limitValue,
      search: searchState,
    });
  } catch (error) {
    toaster.error(
      "Une erreur est survenue lors de la récupération de la demande",
    );
    throw error;
  }
};

const fetchEigsDebounce = debounce(async (search) => {
  try {
    await eigStore.get({
      sortBy: sortState.value.sortBy,
      sortDirection: sortState.value.sortDirection,
      limit: limitState.value,
      offset: currentPageState.value * limitState.value,
      search,
    });
  } catch (error) {
    toaster.error(
      "Une erreur est survenue lors de la récupération de la demande",
    );
    throw error;
  }
});

watch([searchState], ([searchValue]) => {
  fetchEigsDebounce(searchValue);
});

const status = [allStatus, eigModel.Statuts.ENVOYE, eigModel.Statuts.LU];
const departement = computed(() => [
  allStatus,
  ...departementStore.departements,
]);
const typesOption = [
  allStatus,
  ...[
    ...Object.values(eigModel.Types[eigModel.Categorie.VICTIMES]).map((t) => ({
      text:
        mapEigToLabel[t] +
        (t === eigModel.Types[eigModel.Categorie.VICTIMES].AUTRE
          ? " (victime)"
          : ""),
      value: t,
    })),
    ...Object.values(eigModel.Types[eigModel.Categorie.SANTE]).map((t) => ({
      text:
        mapEigToLabel[t] +
        (t === eigModel.Types[eigModel.Categorie.SANTE].AUTRE
          ? " (santé)"
          : ""),
      value: t,
    })),
    ...Object.values(eigModel.Types[eigModel.Categorie.SECURITE]).map((t) => ({
      text:
        mapEigToLabel[t] +
        (t === eigModel.Types[eigModel.Categorie.SECURITE].AUTRE
          ? " (sécurité)"
          : ""),
      value: t,
    })),
    ...Object.values(
      eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME],
    ).map((t) => ({
      text:
        mapEigToLabel[t] +
        (t === eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME].AUTRE
          ? " (fonctionnement organisme)"
          : ""),
      value: t,
    })),
  ].sort((t1, t2) => (t1.text < t2.text ? -1 : 1)),
];
const onSelect = (value, key) => {
  if (value === allStatus) {
    searchState[key] = null;
  } else {
    searchState[key] = value;
  }
};

const headers = [
  {
    column: "organisme",
    text: "Organisme",
    format: (value) => value.raisonSociale ?? `${value?.prenom} ${value?.nom}`,
    sort: true,
  },
  {
    column: "idFonctionnelle",
    text: "Déclaration",
    sort: true,
  },
  { column: "departement", text: "Territoire", sort: true },
  {
    column: "libelle",
    text: "Séjour",
    sort: true,
  },
  {
    column: "dateDebut",
    text: "Dates du séjour (Début-fin)",
    format: (value) =>
      `${dayjs(value.dateDebut).format("DD/MM/YYYY")} - ${dayjs(value.dateFin).format("DD/MM/YYYY")}`,
    sort: true,
  },
  {
    column: "types",
    text: "Types d'événement",
    component: ({ types }) => ({
      component: EigTypeListe,
      types: (types ?? []).map((t) => mapEigToLabel[t]),
    }),
  },
  {
    column: "date",
    text: "Dates de l'incident",
    format: (value) => dayjs(value.date).format("DD/MM/YYYY"),
    sort: true,
  },
  {
    column: "dateDepot",
    text: "Dates de dépôt",
    format: (value) => dayjs(value.dateDepot).format("DD/MM/YYYY"),
    sort: true,
  },
  {
    column: "statut",
    text: "Statut",
    component: ({
      statut,
      readByDreets,
      readByDdets,
      agrementRegionObtention,
      departement,
    }) => ({
      component: EigStatusBadge,
      statut,
      dreets: { isRead: readByDreets, territoireCode: agrementRegionObtention },
      ddets: { isRead: readByDdets, territoireCode: departement },
    }),
    sort: true,
  },
];

const updateSort = ({ sortBy: sb, sortDirection: sd }) => {
  sortState.value = {
    sortBy: sb,
    sortDirection: sd,
  };
  paginateResults(sortState.value, limitState.value, currentPageState.value);
};
const updateItemsByPage = (val) => {
  limitState.value = parseInt(val);
  paginateResults(sortState.value, limitState.value, currentPageState.value);
};
const updateCurrentPage = (val) => {
  currentPageState.value = val;
  paginateResults(sortState.value, limitState.value, currentPageState.value);
};

const readEig = async (id) => {
  try {
    await eigStore.markAsRead(id);
    navigateTo(`/eig/${id}`);
  } catch (error) {
    toaster.error("Une erreur est survenue lors de la lecture de l'eig");
    throw error;
  }
};

const eigIdToRead = ref(null);

const openModal = (state) => {
  const eig = eigStore.getById(state.id);
  if (utilsEig.mustMarkAsRead(eig, usersStore.user)) {
    eigIdToRead.value = state.id;
  } else {
    navigateTo(`/eig/${state.id}`);
  }
};
const closeEigModal = () => (eigIdToRead.value = null);
</script>
