<template>
  <DemandesSejourDefaultTableFilters
    v-model:id-fonctionnelle="idFonctionnelle"
    v-model:organisme="organisme"
    v-model:libelle="libelle"
    v-model:status="status"
    @filters-update="updateData"
  />
  <DsfrDataTableV2Wrapper
    v-model:limit="limit"
    v-model:offset="offset"
    v-model:sort="sort"
    v-model:sort-direction="sortDirection"
    :titles="titles"
    :table-title="title"
    :data="data"
    :total="total"
    row-id="declarationId"
    is-bordered
    is-sortable
    @update-data="updateData"
  >
    <template #cell:dateDebut="{ row }">
      {{ getDateDebutFin(row) }}
    </template>
    <template #cell:custom-saison="{ row }">
      {{ getSaison(row) }}
    </template>
    <template #cell:organisme="{ row }">
      {{ getOrganismeTitle(row) }}
    </template>
    <template #cell:custom-declaration="{ row }">
      <DemandesSejourDeclaration :statut="row.statut" />
    </template>
    <template #cell:statut="{ row }">
      <div>
        <DemandeStatusBadge :statut="row.statut" type="bo" />
      </div>
    </template>
    <template #cell:custom-edit="{ row }">
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
} from "@vao/shared";

const demandeSejourStore = useDemandeSejourStore();
const userStore = useUserStore();
const route = useRoute();
const data = computed(() => demandeSejourStore.demandes);
const total = computed(() => demandeSejourStore.total);

const { query } = route;

const titles = [
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
    key: "custom-saison",
    label: "Saison",
  },
  {
    key: "organisme",
    label: "Organisme",
  },
  {
    key: "custom-declaration",
    label: "Declaration",
  },
  {
    key: "statut",
    label: "Statut",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom-edit",
    label: "Edit",
    options: {
      isFixedRight: true,
    },
  },
];

const title = computed(
  () => `Liste des déclarations reçues (${demandeSejourStore.stats?.global})`,
);

const sortableTitles = titles.flatMap((title) =>
  title.options?.isSortable ? [title.key] : [],
);

const defaultStatus = [...Object.values(demandesSejours.statuts)];
const idFonctionnelle = ref(query.idFonctionnelle ?? "");
const libelle = ref(query.libelle ?? "");
const organisme = ref(query.organisme ?? "");
const status = ref(
  query.statuts
    ? query.statuts
        .split(",")
        .filter((statut) => Object.values(defaultStatus).includes(statut))
    : [],
);
const limit = ref(parseInt(query.limit, 10) || 10);
const offset = ref(parseInt(query.offset, 10) || 0);
const sort = ref(sortableTitles.includes(query.sort) ? query.sort : "");
const sortDirection = ref(
  ["", "asc", "desc"].includes(query.sortDirection) ? query.sortDirection : "",
);

const isValidParams = (params) =>
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);

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
      search: getSearchParams(),
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

const getDateDebutFin = (demande) => demandesSejours.getDateDebutFin(demande);
const getOrganismeTitle = (demande) =>
  demandesSejours.getOrganismeTitle(demande);
const getSaison = (demande) => demandesSejours.getSaison(demande);

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
