<template>
  <DemandeSejourTableFilters
    v-model:id-fonctionnelle="idFonctionnelle"
    v-model:libelle="libelle"
    v-model:siret="siret"
    v-model:status="status"
    v-model:departement-suivi="departementSuivi"
    v-model:season="season"
    @filters-update="() => updateDataDebounced(true)"
    @export-get="getCsv"
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
    @update-data="() => updateDataDebounced()"
  >
    <template #cell-dateDebut="{ row }">
      {{ displayDate(row.dateDebut) }} -<br />
      {{ displayDate(row.dateFin) }}
    </template>
    <template #cell-statut="{ cell }">
      <div>
        <DemandeStatusBadge :statut="cell" type="fu" />
      </div>
    </template>
    <template #cell-editedAt="{ cell }">
      {{ displayDate(cell) }}
    </template>
    <template #cell-custom:edit="{ row }">
      <div class="buttons-group">
        <NuxtLink
          :to="`/demande-sejour/${row.declarationId}?defaultTabIndex=0`"
          title="Naviguer vers la demande séjour"
          class="fr-btn fr-btn--sm inline-flex justify-center no-background-image"
        >
          <span class="fr-icon-arrow-right-s-line" aria-hidden="true"></span>
          <span class="fr-sr-only"
            >Naviguer vers la demande séjour: {{ row.idFonctionnelle }}</span
          >
        </NuxtLink>
        <DsfrButton
          class="button--danger"
          :icon="
            row.statut === draftStatus
              ? 'ri:delete-bin-2-line'
              : 'ri:close-line'
          "
          icon-only
          secondary
          size="small"
          type="button"
          :label="row.statut === draftStatus ? 'Supprimer' : 'Annuler'"
          :disabled="
            !enabledDeleteCancelStatus.includes(row.statut) ||
            userStore.user?.siret !== row.siret
          "
          @click="handleRemoveClose(row.declarationId, row.statut)"
        />
        <DsfrButton
          icon="ri:file-copy-2-fill"
          icon-only
          secondary
          size="small"
          type="button"
          label="Dupliquer"
          :disabled="!enabledCopyStatus.includes(row.statut)"
          @click="handleDuplication(row.declarationId)"
        />
      </div>
    </template>
  </DsfrDataTableV2Wrapper>
  <ValidationModal
    modal-ref="modal"
    name="modal-ds-action"
    :opened="popUpParams !== null"
    :title="`${popUpParams?.msg}  ?`"
    :on-close="() => (popUpParams = null)"
    :on-validate="popUpParams?.cb ?? (() => {})"
    validation-label="Confirmer"
  >
    <p>Vous vous apprêtez à effectuer l’action suivante :</p>
    <ul>
      <li>{{ popUpParams?.msg }}</li>
    </ul>
    <p>Souhaitez vous poursuivre?</p>
  </ValidationModal>
</template>

<script setup>
import dayjs from "dayjs";
import {
  DemandeStatusBadge,
  DsfrDataTableV2Wrapper,
  status as statusUtils,
  ValidationModal,
  isValidParams,
  usePagination,
  columnsTable,
} from "@vao/shared";
import { exportCsv } from "../../utils/csv";

const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();
const departementStore = useDepartementStore();
const toaster = useToaster();
const userStore = useUserStore();

const data = computed(() => demandeSejourStore.demandes);
const total = computed(() => demandeSejourStore.totalDemandes);
const optionType = columnsTable.optionType;

const { query } = route;

const title = "Liste des séjours";

const draftStatus = statusUtils.defaultStatus.BROUILLON;
const enabledCopyStatus = [
  statusUtils.defaultStatus.BROUILLON,
  statusUtils.defaultStatus.TRANSMISE,
  statusUtils.defaultStatus.EN_COURS,
  statusUtils.defaultStatus.ANNULEE,
  statusUtils.defaultStatus.ABANDONNEE,
];

const enabledDeleteCancelStatus = [
  statusUtils.defaultStatus.BROUILLON,
  statusUtils.defaultStatus.TRANSMISE,
  statusUtils.defaultStatus.EN_COURS,
  statusUtils.defaultStatus.A_MODIFIER,
  statusUtils.defaultStatus.ATTENTE_8_JOUR,
  statusUtils.defaultStatus.TRANSMISE_8J,
  statusUtils.defaultStatus.EN_COURS_8J,
  statusUtils.defaultStatus.A_MODIFIER_8J,
  statusUtils.defaultStatus.VALIDEE_8J,
];

const defs = [
  ["idFonctionnelle", "Numéro de déclaration", optionType.SORTABLE],
  ["libelle", "Nom du séjour", optionType.SORTABLE],
  ["departementSuivi", "Dept", optionType.SORTABLE],
  ["siret", "Siret", optionType.SORTABLE],
  ["dateDebut", "Dates (Début-fin)", optionType.SORTABLE],
  ["statut", "Statut", optionType.SORTABLE],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];

const columns = columnsTable.buildColumns(defs);

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const defaultStatus = [...Object.values(statusUtils.defaultStatus)];

const defaultDepartements = computed(() =>
  departementStore.departements.map((d) => ({ label: d.text, value: d.value })),
);

const seasons = ["hiver", "printemps", "été", "automne"];

const paramsToArray = (params) => (Array.isArray(params) ? params : [params]);

const idFonctionnelle = ref(query.idFonctionnelle ?? "");
const libelle = ref(query.libelle ?? "");
const siret = ref(query.siret ?? "");
const departementSuivi = ref([]);
const status = ref(
  query.statut
    ? paramsToArray(query.statut).filter((statut) =>
        defaultStatus.includes(statut),
      )
    : [],
);
const season = ref(
  query.periode
    ? paramsToArray(query.periode).filter((s) => seasons.includes(s))
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
  ...(isValidParams(departementSuivi.value)
    ? { departementSuivi: departementSuivi.value }
    : {}),
  ...(isValidParams(status.value) ? { statut: status.value } : {}),
  ...(isValidParams(season.value) ? { periode: season.value } : {}),
});

let timeout = null;

const generateApiQuery = () => ({
  limit: limit.value,
  offset: offset.value,
  ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
  ...(isValidParams(sortDirection.value)
    ? { sortDirection: sortDirection.value.toUpperCase() }
    : {}),
  ...getSearchParams(),
});

const updateData = (query) => demandeSejourStore.fetchDemandes(query);

const updateDataDebounced = (resetOffset = false) => {
  if (resetOffset) {
    offset.value = 0;
  }
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const query = generateApiQuery();
    updateData(query);
    navigateTo({
      query,
    });
  }, 300);
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});

const displayDate = (date) => dayjs(date).format("DD/MM/YYYY");

const init = async () => {
  await departementStore.fetch();
  departementSuivi.value = query.departementSuivi?.length
    ? paramsToArray(query.departementSuivi).filter((dep) =>
        defaultDepartements.value.some((d) => d.value === dep),
      )
    : [];
  const apiQuery = generateApiQuery();
  updateData(apiQuery);
};

init();

// actions

const popUpParams = ref(null);

const handleDuplication = (declarationId) => {
  popUpParams.value = {
    cb: () => copyDS(declarationId),
    msg: "Duplication d’une déclaration",
  };
};

const handleRemoveClose = (declarationId, status) => {
  if (status === draftStatus) {
    popUpParams.value = {
      cb: () => deleteDS(declarationId),
      msg: "Suppression d’une déclaration",
    };
  } else {
    popUpParams.value = {
      cb: () => cancelDS(declarationId),
      msg: "Annulation d’une déclaration",
    };
  }
};

const displayToasterError = (type) => {
  toaster.error({
    titleTag: "h2",
    description: `Une erreur est survenue lors de ${type} de la déclaration de séjour`,
  });
};

const copyDS = async (declarationId) => {
  try {
    const response = await demandeSejourStore.copyDemandeSejour(declarationId);
    if (response.declarationId) {
      toaster.success({ titleTag: "h2", description: `Déclaration dupliquée` });
    } else {
      displayToasterError("la copie");
    }
  } catch (error) {
    displayToasterError("la copie");
    throw error;
  } finally {
    // closeModal
    popUpParams.value = null;
  }
  updateData();
};

const deleteDS = async (declarationId) => {
  try {
    const response =
      await demandeSejourStore.deleteDemandeSejour(declarationId);
    if (response.deletedRows === 1) {
      toaster.success({ titleTag: "h2", description: `Déclaration supprimée` });
    } else {
      displayToasterError("la suppression");
    }
  } catch (error) {
    displayToasterError("la suppression");
    throw error;
  } finally {
    // closeModal
    popUpParams.value = null;
  }
  updateData();
};

const cancelDS = async (declarationId) => {
  try {
    const response =
      await demandeSejourStore.cancelDemandeSejour(declarationId);
    if (response.canceletedRows === 1) {
      toaster.success({ titleTag: "h2", description: `Déclaration annulée` });
    } else {
      displayToasterError("l'annulation");
    }
  } catch (error) {
    displayToasterError("l'annulation");
    throw error;
  } finally {
    // closeModal
    popUpParams.value = null;
  }
  updateData();
};

const getCsv = async () => {
  const response = await demandeSejourStore.exportSejours();
  exportCsv(response, "sejours.csv");
};
</script>

<style scoped>
.no-background-image {
  background-image: none;
}

.buttons-group {
  display: flex;
  gap: 1rem;
}

.button--danger:not(:disabled) {
  color: var(--text-action-high-red-marianne);
  box-shadow: inset 0 0 0 1px var(--border-action-high-red-marianne);
}

.link__dsfrButton {
  height: 100%;
}
</style>
