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

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-roles"],
});

import dayjs from "dayjs";
import EigStatusBadge from "@vao/shared/src/components/eig/EigStatusBadge.vue";
import {
  eigModel,
  EigTypeListe,
  RangeDatePicker,
  TableWithBackendPagination,
  ValidationModal,
} from "@vao/shared";
import { mapEigToLabel } from "@vao/shared/src/utils/eigUtils";
import { getEigPermissions, canDelete } from "../../utils/eig";

const eig = reactive({
  allowEigReadWrite: false,
  allowEigReadOnly: false,
  canDelete,
});

const { allowEigReadWrite, allowEigReadOnly } = getEigPermissions();
eig.allowEigReadWrite = allowEigReadWrite;
eig.allowEigReadOnly = allowEigReadOnly;

const DsfrButton = resolveComponent("DsfrButton");

const toaster = useToaster();

const eigStore = useEigStore();
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
  dateRange: null,
});

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

const fetchEigDebounce = debounce(async (search) => {
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
  fetchEigDebounce(searchValue);
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
    column: "idFonctionnelle",
    text: "Déclaration",
    sort: true,
  },
  {
    column: "createdAt",
    text: "Date de déclaration de l’EIG",
    format: (value) => dayjs(value.createdAt).format("DD/MM/YYYY"),
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
      statut: statut,
      dreets: { isRead: readByDreets, territoireCode: agrementRegionObtention },
      ddets: { isRead: readByDdets, territoireCode: departement },
    }),
    sort: true,
  },
  {
    text: "Actions",
    component: ({ statut, id }) => ({
      component: DsfrButton,
      disabled: !(eig.canDelete(statut) && eig.allowEigReadWrite),
      onClick: (event) => {
        event.stopPropagation();
        eigToDelete.value = id;
      },
      label: "Suppression",
      iconOnly: true,
      icon: "ri:delete-bin-2-line",
    }),
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

const navigate = (state) => {
  navigateTo(
    `/eig/${state.id}${state.statut !== eigModel.Statuts.BROUILLON ? "#eig-recap" : ""}`,
  );
};

const eigToDelete = ref(null);

const closeEigModal = () => (eigToDelete.value = null);
const deleteEig = async () => {
  try {
    await eigStore.delete(eigToDelete.value);
    await eigStore.get();
  } catch (error) {
    toaster.error("Une erreur est survenue de la suppression de l'EIG");
    throw error;
  } finally {
    closeEigModal();
  }
};

try {
  await eigStore.get({
    limit: defaultLimit,
    offset: defaultOffset,
    search: searchState,
  });
} catch (error) {
  toaster.error("Une erreur est survenue lors de la récupération des eigs");
  throw error;
}
</script>
