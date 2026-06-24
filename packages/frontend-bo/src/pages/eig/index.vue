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
              <DsfrInputGroup
                v-model="searchState.idFonctionnelle"
                type="text"
                name="Déclaration"
                label="Déclaration"
                placeholder="Déclaration"
                :label-visible="true"
              />
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <DsfrInputGroup
                v-model="searchState.organisme"
                type="text"
                name="organisme"
                label="Organisme"
                placeholder="Organisme"
                :label-visible="true"
              />
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <DsfrInputGroup
                v-model="searchState.libelle"
                type="text"
                name="Séjour"
                label="Séjour"
                placeholder="Séjour"
                :label-visible="true"
              />
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
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
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
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
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
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
          <div class="fr-grid-row fr-grid-row--gutters">
            <div class="fr-fieldset__element fr-col-12 fr-col-md-3 fr-col-lg-2">
              <label class="fr-label" for="date-start">Date début</label>
              <input
                id="date-start"
                v-model="searchState.startAt"
                class="fr-input"
                type="date"
              />
            </div>

            <div class="fr-fieldset__element fr-col-12 fr-col-md-3 fr-col-lg-2">
              <label class="fr-label" for="date-end">Date fin</label>
              <input
                id="date-end"
                v-model="searchState.endAt"
                class="fr-input"
                type="date"
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
      >Vous vous apprêtez à consulter une déclaration d’un Evènement Indésirable
      Grave. Cette consultation enverra un email de notification à l’organisme.
    </ValidationModal>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import {
  eigModel,
  EigStatusBadge,
  EigTypeListe,
  TableWithBackendPagination,
  ValidationModal,
  eigUtils,
  useToaster,
} from "@vao/shared-ui";
const mapEigToLabel = eigUtils.mapEigToLabel;

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const departementStore = useDepartementStore();
const usersStore = useUserStore();
const eigStore = useEigStore();

const toaster = useToaster();

type SortState = {
  sortBy?: string;
  sortDirection?: string;
};

type SearchPayload = {
  libelle: string | null;
  statut: string | null;
  idFonctionnelle: string | null;
  type: string | null;
  organisme: string | null;
  departement: string | null;
  startAt: string | null;
  endAt: string | null;
};

type SearchPayloadKey = keyof SearchPayload;

type EigListRow = {
  raisonSociale?: string | null;
  prenom?: string | null;
  nom?: string | null;
  dateDebut?: string;
  dateFin?: string;
  types?: Array<string | null> | null;
  date?: string;
  dateDepot?: string;
  statut?: string;
  readByDreets?: boolean;
  readByDdets?: boolean;
  agrementRegionObtention?: string | null;
  departement?: string | null;
};

const defaultLimit = 10;
const defaultOffset = 0;

const allStatus = "Tous les statuts";
const sortState = ref<SortState>({});
const currentPageState = ref<number>(defaultOffset);
const limitState = ref<number>(defaultLimit);
const searchState = reactive<SearchPayload>({
  libelle: null,
  statut: null,
  idFonctionnelle: null,
  type: null,
  organisme: null,
  departement: null,
  startAt: null,
  endAt: null,
});

const isValidDate = (value: string | null) => {
  if (!value) return false;

  // format exact YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const buildSearchParam = (search: SearchPayload) =>
  JSON.stringify({
    ...search,
    startAt: isValidDate(search.startAt) ? search.startAt : null,
    endAt: isValidDate(search.endAt) ? search.endAt : null,
  });

try {
  await eigStore.get({
    limit: defaultLimit,
    offset: defaultOffset,
    search: buildSearchParam(searchState),
  });
  await departementStore.fetch();
} catch (error) {
  toaster.error({
    description: "Une erreur est survenue lors de la récupération des EIG",
    role: "alert",
  });
  throw error;
}

const paginateResults = async (
  sortValue: SortState,
  limitValue: number,
  currentPageValue: number,
) => {
  try {
    await eigStore.get({
      sortBy: sortValue.sortBy,
      sortDirection: sortValue.sortDirection,
      limit: limitValue,
      offset: currentPageValue * limitValue,
      search: buildSearchParam(searchState),
    });
  } catch (error) {
    toaster.error({
      description:
        "Une erreur est survenue lors de la récupération de la demande",
      role: "alert",
    });
    throw error;
  }
};

const fetchEigsDebounce = debounce(async (search: string) => {
  try {
    await eigStore.get({
      sortBy: sortState.value.sortBy,
      sortDirection: sortState.value.sortDirection,
      limit: limitState.value,
      offset: currentPageState.value * limitState.value,
      search,
    });
  } catch (error) {
    toaster.error({
      description:
        "Une erreur est survenue lors de la récupération de la demande",
      role: "alert",
    });
    throw error;
  }
});

watch([searchState], ([searchValue]) => {
  fetchEigsDebounce(buildSearchParam(searchValue));
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
const onSelect = (value: string | number, key: SearchPayloadKey) => {
  if (value === allStatus) {
    searchState[key] = null;
  } else {
    searchState[key] = String(value);
  }
};

type EigTableHeader = {
  column: string;
  text: string;
  sort?: boolean;
  format?: (value: EigListRow | null | undefined) => string;
  component?: (value: any) => { component: unknown; [key: string]: unknown };
};

const headers: Array<EigTableHeader> = [
  {
    column: "organisme",
    text: "Organisme",
    format: (value: EigListRow | null | undefined) =>
      value?.raisonSociale ?? `${value?.prenom ?? ""} ${value?.nom ?? ""}`,
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
    format: (value: EigListRow | null | undefined) =>
      `${dayjs(value?.dateDebut).format("DD/MM/YYYY")} - ${dayjs(value?.dateFin).format("DD/MM/YYYY")}`,
    sort: true,
  },
  {
    column: "types",
    text: "Types d'événement",
    component: ({ types }: { types?: Array<string | null> | null }) => ({
      component: EigTypeListe,
      types: (types ?? [])
        .filter((t): t is string => typeof t === "string")
        .map((t) => mapEigToLabel[t]),
    }),
  },
  {
    column: "date",
    text: "Dates de l'incident",
    format: (value: EigListRow | null | undefined) =>
      dayjs(value?.date).format("DD/MM/YYYY"),
    sort: true,
  },
  {
    column: "dateDepot",
    text: "Dates de dépôt",
    format: (value: EigListRow | null | undefined) =>
      dayjs(value?.dateDepot).format("DD/MM/YYYY"),
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
    }: {
      statut?: string;
      readByDreets?: boolean;
      readByDdets?: boolean;
      agrementRegionObtention?: string | null;
      departement?: string | null;
    }) => ({
      component: EigStatusBadge,
      statut,
      dreets: { isRead: readByDreets, territoireCode: agrementRegionObtention },
      ddets: { isRead: readByDdets, territoireCode: departement },
    }),
    sort: true,
  },
];

const updateSort = ({
  sortBy: sb,
  sortDirection: sd,
}: {
  sortBy: string;
  sortDirection: string;
}) => {
  sortState.value = {
    sortBy: sb,
    sortDirection: sd,
  };
  paginateResults(sortState.value, limitState.value, currentPageState.value);
};
const updateItemsByPage = (val: number | string) => {
  limitState.value = Number(val);
  paginateResults(sortState.value, limitState.value, currentPageState.value);
};
const updateCurrentPage = (val: number | string) => {
  currentPageState.value = Number(val);
  paginateResults(sortState.value, limitState.value, currentPageState.value);
};

const readEig = async (id: number | null) => {
  if (id === null) {
    return;
  }
  try {
    await eigStore.markAsRead(String(id));
    navigateTo(`/eig/${id}`);
  } catch (error) {
    toaster.error({
      description: "Une erreur est survenue lors de la lecture de l'eig",
      role: "alert",
    });
    throw error;
  }
};

const eigIdToRead = ref<number | null>(null);

const openModal = (state: { id: number }) => {
  const eig = eigStore.getById(state.id);
  if (utilsEig.mustMarkAsRead(eig, usersStore.user)) {
    eigIdToRead.value = state.id;
  } else {
    navigateTo(`/eig/${state.id}`);
  }
};
const closeEigModal = () => (eigIdToRead.value = null);
</script>
