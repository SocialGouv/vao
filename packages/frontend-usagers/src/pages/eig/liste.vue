<template>
  <div class="fr-container fr-pt-8v">
    <h1>Liste de mes événements indésirables et graves (EIG)</h1>
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
          </div>
          <div class="fr-fieldset fr-grid-row fr-grid-row--gutters">
            <div class="fr-fieldset__element fr-col-12 fr-col-md-3 fr-col-lg-2">
              <label class="fr-label" for="date-start">Date de l’EIG du</label>
              <span class="fr-hint-text">Format attendu : JJ/MM/AAAA</span>
              <input
                id="date-start"
                v-model="searchState.startAt"
                class="fr-input"
                type="date"
              />
            </div>
            <div class="fr-fieldset__element fr-col-12 fr-col-md-3 fr-col-lg-2">
              <label class="fr-label" for="date-end">au</label>
              <span class="fr-hint-text">Format attendu : JJ/MM/AAAA</span>
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
      :on-click-cell="navigate"
      @update-sort="updateSort"
      @update-items-by-page="updateItemsByPage"
      @update-current-page="updateCurrentPage"
    />
    <div class="fr-fieldset">
      <DsfrButton v-if="eig.allowEigReadWrite">
        <NuxtLink to="/eig"> Déclarer un EIG</NuxtLink>
      </DsfrButton>
    </div>
    <ValidationModal
      modal-ref="modal-eig-list"
      name="delete-eig"
      :opened="eigToDelete != null"
      title="Suppression d'un EIG ?"
      :on-close="closeEigModal"
      :on-validate="deleteEig"
      >Vous vous apprêtez à supprimer l'EIG : <br />
      - {{ eigToDelete }}
    </ValidationModal>
  </div>
</template>

<script setup lang="ts">
import { formatFR, isValidIsoShort } from "@vao/shared-bridge";
import {
  eigModel,
  EigTypeListe,
  TableWithBackendPagination,
  ValidationModal,
  eigUtils,
  EigStatusBadge,
  useToaster,
} from "@vao/shared-ui";
import { getEigPermissions, canDelete } from "../../utils/eig";

const mapEigToLabel = eigUtils.mapEigToLabel;

defineOptions({
  name: "ListeEigPage",
});

definePageMeta({
  middleware: ["is-connected", "check-roles"],
});

type SortState = {
  sortBy?: string;
  sortDirection?: string;
};

type SearchPayload = {
  libelle: string | null;
  statut: string | null;
  idFonctionnelle: string | null;
  type: string | null;
  startAt: string | null;
  endAt: string | null;
};

type SearchFilterKey = "libelle" | "statut" | "idFonctionnelle" | "type";

const eig = reactive({
  allowEigReadWrite: false,
  allowEigReadOnly: false,
  canDelete,
});

const { allowEigReadWrite, allowEigReadOnly } = getEigPermissions();
eig.allowEigReadWrite = allowEigReadWrite ?? false;
eig.allowEigReadOnly = allowEigReadOnly ?? false;

const DsfrButton = resolveComponent("DsfrButton");

const toaster = useToaster();

const eigStore = useEigStore();
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
  startAt: null,
  endAt: null,
});

const buildSearchParam = (search: SearchPayload) =>
  JSON.stringify({
    ...search,
    startAt: isValidIsoShort(search.startAt) ? search.startAt : null,
    endAt: isValidIsoShort(search.endAt) ? search.endAt : null,
  });

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

const fetchEigDebounce = debounce(async () => {
  try {
    await eigStore.get({
      sortBy: sortState.value.sortBy,
      sortDirection: sortState.value.sortDirection,
      limit: limitState.value,
      offset: currentPageState.value * limitState.value,
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
});

watch([searchState], () => {
  void fetchEigDebounce();
});

const status = [
  allStatus,
  eigModel.Statuts.BROUILLON,
  eigModel.Statuts.ENVOYE,
  eigModel.Statuts.LU,
];
const typesOption = [
  allStatus,
  ...[
    ...Object.values(eigModel.Types[eigModel.Categorie.VICTIMES]).map(
      (t: string) => ({
        text:
          mapEigToLabel[t as keyof typeof mapEigToLabel] +
          (t === eigModel.Types[eigModel.Categorie.VICTIMES].AUTRE
            ? " (victime)"
            : ""),
        value: t,
      }),
    ),
    ...Object.values(eigModel.Types[eigModel.Categorie.SANTE]).map(
      (t: string) => ({
        text:
          mapEigToLabel[t as keyof typeof mapEigToLabel] +
          (t === eigModel.Types[eigModel.Categorie.SANTE].AUTRE
            ? " (santé)"
            : ""),
        value: t,
      }),
    ),
    ...Object.values(eigModel.Types[eigModel.Categorie.SECURITE]).map(
      (t: string) => ({
        text:
          mapEigToLabel[t as keyof typeof mapEigToLabel] +
          (t === eigModel.Types[eigModel.Categorie.SECURITE].AUTRE
            ? " (sécurité)"
            : ""),
        value: t,
      }),
    ),
    ...Object.values(
      eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME],
    ).map((t: string) => ({
      text:
        mapEigToLabel[t as keyof typeof mapEigToLabel] +
        (t === eigModel.Types[eigModel.Categorie.FONCTIONNEMENT_ORGANISME].AUTRE
          ? " (fonctionnement organisme)"
          : ""),
      value: t,
    })),
  ].sort((t1, t2) => (t1.text < t2.text ? -1 : 1)),
];
const onSelect = (value: string | number | null, key: SearchFilterKey) => {
  const nextValue = value === allStatus ? null : String(value);
  searchState[key] = nextValue;
};

const headers = [
  {
    column: "idFonctionnelle",
    text: "Déclaration",
    sort: true,
  },
  {
    column: "createdAt",
    text: "Date de déclaration de l’EIG",
    format: (value: { createdAt?: string }) =>
      value?.createdAt ? formatFR(new Date(value.createdAt)) : "",
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
    text: "Dates (Début-fin)",
    format: (value: { dateDebut?: string; dateFin?: string }) =>
      `${value?.dateDebut ? formatFR(new Date(value.dateDebut)) : ""} - ${value?.dateFin ? formatFR(new Date(value.dateFin)) : ""}`,

    sort: true,
  },
  {
    column: "types",
    text: "Types d'événement",
    component: ({ types }: { types?: Array<string | null> | null }) => ({
      component: EigTypeListe,
      types: (types ?? []).map((t: string | null) =>
        t ? mapEigToLabel[t as keyof typeof mapEigToLabel] : "",
      ),
    }),
  },
  {
    column: "date",
    text: "Dates de l'incident",
    format: (value: { date?: string }) =>
      value?.date ? formatFR(new Date(value.date)) : "",
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
  {
    text: "Actions",
    component: ({ statut, id }: { statut?: string; id?: string }) => ({
      component: DsfrButton,
      disabled: !(eig.canDelete(statut) && eig.allowEigReadWrite),
      onClick: (event: MouseEvent) => {
        event.stopPropagation();
        eigToDelete.value = id ?? null;
      },
      label: "Suppression",
      iconOnly: true,
      icon: "ri:delete-bin-2-line",
    }),
  },
];

const updateSort = ({ sortBy: sb, sortDirection: sd }: SortState) => {
  sortState.value = {
    sortBy: sb,
    sortDirection: sd,
  };
  void paginateResults(
    sortState.value,
    limitState.value,
    currentPageState.value,
  );
};
const updateItemsByPage = (val: string | number) => {
  limitState.value = parseInt(String(val), 10);
  void paginateResults(
    sortState.value,
    limitState.value,
    currentPageState.value,
  );
};
const updateCurrentPage = (val: number) => {
  currentPageState.value = val;
  void paginateResults(
    sortState.value,
    limitState.value,
    currentPageState.value,
  );
};

const navigate = (state: { id: string; statut?: string }) => {
  navigateTo(
    `/eig/${state.id}${state.statut !== eigModel.Statuts.BROUILLON ? "#eig-recap" : ""}`,
  );
};

const eigToDelete = ref<string | null>(null);

const closeEigModal = () => (eigToDelete.value = null);
const deleteEig = async () => {
  if (!eigToDelete.value) {
    return;
  }

  try {
    await eigStore.delete(eigToDelete.value);
    await eigStore.get();
  } catch (error) {
    toaster.error({
      description: "Une erreur est survenue lors de la suppression de l'EIG",
      role: "alert",
    });
    throw error;
  } finally {
    closeEigModal();
  }
};

try {
  await eigStore.get({
    limit: defaultLimit,
    offset: defaultOffset,
    search: buildSearchParam(searchState),
  });
} catch (error) {
  toaster.error({
    description: "Une erreur est survenue lors de la récupération des eigs",
    role: "alert",
  });
  throw error;
}
</script>
