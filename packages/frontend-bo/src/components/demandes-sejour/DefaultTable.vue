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
        <DemandesSejourDemandeStatusBadge :statut="row.statut" />
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
import { DsfrDataTableV2Wrapper, ValidationModal } from "@vao/shared";

const demandeSejourStore = useDemandeSejourStore();
const userStore = useUserStore();
const data = computed(() => demandeSejourStore.demandes);
const total = computed(() => demandeSejourStore.total);

const params = Object.fromEntries(new URLSearchParams(window.location.search));

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

const defaultStatus = [
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
];

const idFonctionnelle = ref(params.idFonctionnelle || "");
const libelle = ref(params.libelle || "");
const organisme = ref(params.organisme || "");
const status = ref(
  params.status
    ? params.status
        .split(",")
        .filter((statut) => Object.values(defaultStatus).includes(statut))
    : [],
);
const limit = ref(parseInt(params.limit, 10) || 10);
const offset = ref(parseInt(params.offset, 10) || 0);
const sort = ref(sortableTitles.includes(params.sort) ? params.sort : "");
const sortDirection = ref(
  ["", "asc", "desc"].includes(params.sortDirection)
    ? params.sortDirection
    : "",
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
        ...(isValidParams(status.value) // we use english for url, but french for api
          ? { status: status.value.join(",") }
          : {}),
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
    await demandeSejourStore.prendreEnCharge();
    declarationAPrendreEnCharge.value = null;
    navigateTo({
      path: `/sejours/${declarationId}`,
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
