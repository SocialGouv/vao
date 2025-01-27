<template>
  <DemandeSejourTableFilters
    v-model:id-fonctionnelle="idFonctionnelle"
    v-model:libelle="libelle"
    v-model:siret="siret"
    v-model:status="status"
    v-model:departement-suivi="departementSuivi"
    v-model:season="season"
    @filters-update="onFiltersUpdate"
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
    is-sortable
    @update-data="updateDataDebounced"
  >
    <template #cell:dateDebut="{ row }">
      {{ displayDate(row.dateDebut) }} -<br />
      {{ displayDate(row.dateFin) }}
    </template>
    <template #cell:statut="{ row }">
      <div>
        <DemandeStatusBadge :statut="row.statut" type="fu" />
      </div>
    </template>
    <template #cell:editedAt="{ row }">
      {{ displayDate(row.editedAt) }}
    </template>
    <template #cell:custom-edit="{ row }">
      <div class="buttons-group">
        <NuxtLink
          :to="`/demande-sejour/${row.declarationId}?defaultTabIndex=0`"
          title="Naviguer vers la demande séjour"
          class="no-background-image"
        >
          <DsfrButton
            class="link__dsfrButton"
            icon="ri:arrow-right-s-line"
            icon-only
            primary
            size="small"
            type="button"
          />
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
          :disabled="!enabledDeleteCancelStatus.includes(row.statut)"
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
} from "@vao/shared";

const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();
const departementStore = useDepartementStore();
const toaster = useToaster();

const data = computed(() => demandeSejourStore.demandes);
const total = computed(() => demandeSejourStore.totalDemandes);

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
];

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
    key: "departementSuivi",
    label: "Dept",
    options: {
      isSortable: true,
    },
  },
  {
    key: "siret",
    label: "Établissement déclarant",
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
    key: "statut",
    label: "Statut",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom-edit",
    label: "Action",
  },
];

const sortableTitles = titles.flatMap((title) =>
  title.options?.isSortable ? [title.key] : [],
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
  sortableTitles,
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

const onFiltersUpdate = () => {
  offset.value = 0;
  updateDataDebounced();
};

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

const updateDataDebounced = () => {
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
