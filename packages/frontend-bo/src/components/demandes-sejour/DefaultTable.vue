<template>
  <DemandesSejourDefaultTableFilters
    v-model:id-fonctionnelle="idFonctionnelle"
    v-model:organisme="organisme"
    v-model:libelle="libelle"
    v-model:status="status"
    :filters="filters"
    @filters-update="updateData"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :columns="columns"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="declarationId"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-dateDebut="{ row }">
      {{ displayDate(row.dateDebut) }} -<br />{{ displayDate(row.dateFin) }}
    </template>
    <template #cell-editedAt="{ cell }">
      {{ displayDate(cell) }}
    </template>
    <template #slot:organisme="{ row }">
      {{ getOrganismeTitle(row) }}
    </template>
    <template #cell-custom:declaration="{ row }">
      <DemandesSejourDeclaration :statut="row.statut" />
    </template>
    <template #cell-statut="{ cell }">
      <div>
        <DemandeStatusBadge :statut="cell" type="bo" />
      </div>
    </template>
    <template #cell-custom:edit="{ row }">
      <DsfrButton
        label="naviguer vers la demande séjour"
        icon="ri:arrow-right-s-line"
        icon-only
        primary
        size="small"
        type="button"
        @click="navigate(row)"
      />
    </template>
  </DsfrDataTableV2Wrapper>
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
</template>

<script setup>
import {
  DemandeStatusBadge,
  DsfrDataTableV2Wrapper,
  ValidationModal,
  usePagination,
  isValidParams,
} from "@vao/shared";
import dayjs from "dayjs";

const toaster = useToaster();

const demandeSejourStore = useDemandeSejourStore();
const userStore = useUserStore();
const route = useRoute();
const data = computed(() => demandeSejourStore.demandes);
const total = computed(() => demandeSejourStore.total);

const { query } = route;

const props = defineProps({
  organismeId: { type: String, default: null },
});

const filters = [
  demandesSejours.filters.idFonctionnelle,
  demandesSejours.filters.libelle,
  ...(!props.organismeId ? [demandesSejours.filters.organisme] : []),
  demandesSejours.filters.status,
  demandesSejours.filters.action,
];

const columns = [
  {
    key: "idFonctionnelle",
    label: "Numéro de déclaration",
    options: {
      isSortable: true,
    },
  },
  {
    key: "libelle",
    label: "Nom du séjour",
    options: {
      isSortable: true,
    },
  },
  {
    key: "dateDebut",
    label: "Dates (Début-fin)",
    options: {
      isSortable: true,
    },
  },
  {
    key: "organisme",
    label: "Organisme",
  },
  {
    key: "statut",
    label: "Statut",
    options: {
      isSortable: true,
    },
  },
  {
    key: "editedAt",
    label: "Date édition",
  },
  {
    key: "custom:edit",
    label: "Action",
  },
];

const title = computed(
  () => `Liste des déclarations reçues (${demandeSejourStore.stats?.global})`,
);

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const defaultStatus = [...Object.values(demandesSejours.statuts)];
const idFonctionnelle = ref(query.idFonctionnelle ?? "");
const libelle = ref(query.libelle ?? "");
const organismeId = ref(props.organismeId ?? "");
const organisme = ref(query.organisme ?? "");
const status = ref(
  query.statuts
    ? query.statuts
        .split(",")
        .filter((statut) => Object.values(defaultStatus).includes(statut))
    : [],
);

const { limit, offset, sort, sortDirection } = usePagination(
  query,
  sortableColumns,
);

const getSearchParams = () => ({
  ...(isValidParams(idFonctionnelle.value)
    ? { idFonctionnelle: idFonctionnelle.value }
    : {}),
  ...(isValidParams(libelle.value) ? { libelle: libelle.value } : {}),
  ...(isValidParams(organisme.value) ? { organisme: organisme.value } : {}),
  ...(isValidParams(status.value) ? { statuts: status.value.join(",") } : {}),
});

let timeout = null;

const updateData = () => {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const query = {
      limit: limit.value,
      offset: offset.value,
      ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
      ...(isValidParams(sortDirection.value)
        ? { sortDirection: sortDirection.value.toUpperCase() }
        : {}),
      search: {
        ...getSearchParams(),
        ...(isValidParams(organismeId.value)
          ? { organismeId: organismeId.value }
          : {}),
      },
    };

    demandeSejourStore.fetchDemandes(query);
    navigateTo({
      query: {
        limit: limit.value,
        offset: offset.value,
        ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
        ...(isValidParams(sortDirection.value)
          ? { sortDirection: sortDirection.value }
          : {}),
        ...getSearchParams(),
      },
    });
  }, 300);
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});

const getOrganismeTitle = (demande) =>
  demandesSejours.getOrganismeTitle(demande);
const displayDate = (date) => dayjs(date).format("DD/MM/YYYY");
updateData();

// actions

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
    });
  }
};

const validatePriseEnCharge = async () => {
  const declarationId = declarationAPrendreEnCharge.value.declarationId;
  try {
    await demandeSejourStore.prendreEnCharge(declarationId);
    declarationAPrendreEnCharge.value = null;
    navigateTo({
      path: `/sejours/${declarationId}`,
    });
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
    });
    throw error;
  }
};

// exposxition to parents

defineExpose({
  updateStatus: (value) => {
    status.value = value;
    updateData();
  },
});
</script>
