<template>
  <div>
    <TableWithBackendPagination
      :headers="props.headers"
      :data="props.ds"
      :total-items="props.total"
      :current-page="currentPageState"
      :sort-by="sortState.sortBy"
      :sort-direction="sortState.sortDirection"
      :items-by-page="itemPerPage"
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
import { TableWithBackendPagination, ValidationModal } from "@vao/shared";
import "@vueform/multiselect/themes/default.css";
import { defineProps } from "vue";

const log = logger("pages/sejours");

const toaster = useToaster();
const userStore = useUserStore();

const props = defineProps({
  headers: { type: Object, required: true },
  ds: { type: Array, required: true },
  total: { type: Number, required: true },
  tabIndexNavigation: { type: Number, required: true },
  fetchDemandes: { type: Function, required: true },
  searchParams: { type: Object, required: true },
});

const sortState = ref({});
const currentPageState = ref(0);
const itemPerPage = ref(10);

props.fetchDemandes({
  sortBy: sortState.value.sortBy,
  limit: itemPerPage.value,
  offset: currentPageState.value * itemPerPage.value,
  search: props.searchParams,
});

const fetchPagination = async () =>
  props.fetchDemandes({
    sortBy: sortState.value.sortBy,
    sortDirection: sortState.value.sortDirection,
    limit: itemPerPage.value,
    offset: currentPageState.value * itemPerPage.value,
    search: props.searchParams,
  });

const fetchSearch = async (search) =>
  props.fetchDemandes({
    sortBy: sortState.value.sortBy,
    sortDirection: sortState.value.sortDirection,
    limit: itemPerPage.value,
    offset: currentPageState.value * itemPerPage.value,
    search,
  });

const updateSort = ({ sortBy, sortDirection }) => {
  sortState.value = {
    sortBy,
    sortDirection,
  };
  fetchPagination();
};
const updateItemsByPage = (val) => {
  itemPerPage.value = parseInt(val);
  fetchPagination();
};
const updateCurrentPage = (val) => {
  currentPageState.value = val;
  fetchPagination();
};

const fetchDemandesDebounce = debounce(async (search) => {
  navigateTo({ replace: true, query: search });
  await fetchSearch(search);
});

watch(
  () => props.searchParams,
  (search) => {
    console.log(search);
    fetchDemandesDebounce(search);
  },
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
      path: `/sejours/${state.declarationId}`,
      query: { defaultTabIndex: props.tabIndexNavigation },
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
      path: `/sejours/${declarationId}`,
      query: { defaultTabIndex: props.tabIndexNavigation },
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
</script>
