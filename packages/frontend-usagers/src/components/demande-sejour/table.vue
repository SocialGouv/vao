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
    <template #cell-statut="{ row }">
      <div>
        <DemandeStatusBadge :statut="row.statut" type="fu" />
      </div>
    </template>
    <template #cell-editedAt="{ row }">
      {{ displayDate(row.editedAt) }}
    </template>
    <template #cell-custom:edit="{ row }">
      <div class="buttons-group">
        <NuxtLink
          :to="`/demande-sejour/${row.declarationId}?defaultTabIndex=0`"
          title="Naviguer vers la demande séjour"
          class="fr-btn fr-btn--sm inline-flex justify-center no-background-image"
        >
          <span class="fr-icon-arrow-right-s-line" aria-hidden="true"></span>
          <span class="fr-sr-only">
            Naviguer vers la demande séjour: {{ row.idFonctionnelle }}
          </span>
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
            userStore.user?.userSiret !== row.siret
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
    <p>Vous vous apprêtez à effectuer l'action suivante :</p>
    <ul>
      <li>{{ popUpParams?.msg }}</li>
    </ul>
    <p>Souhaitez vous poursuivre?</p>
  </ValidationModal>
  <div class="fr-container">
    <div class="fr-grid-row fr-grid-row--center">
      <div class="fr-col-5" style="text-align: center">
        <span class="fr-text--bold fr-text--lg"
          >Aidez-nous à améliorer ce service !</span
        ><br />
        <span class="fr-text--sm">
          Donnez-nous votre avis, cela ne prend que 2 minutes.
        </span>
      </div>
      <div class="fr-col-5">
        <DemandeSejourBoutonJdma />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="Data extends Row">
import type { Row, Columns, NestedKeys } from "@vao/shared-ui";

import dayjs from "dayjs";
import {
  DemandeStatusBadge,
  DsfrDataTableV2Wrapper,
  status as statusUtils,
  ValidationModal,
  isValidParams,
  usePagination,
  columnsTable,
  useToaster,
} from "@vao/shared-ui";
import { exportCsv } from "../../utils/csv";
interface PopUpParams {
  cb: () => void;
  msg: string;
}

interface ApiQuery extends Record<string, unknown> {
  limit: number;
  offset: number;
  sortBy?: string;
  sortDirection?: string;
  idFonctionnelle?: string;
  libelle?: string;
  organisme?: string;
  departementSuivi?: string[];
  statut?: string[];
  periode?: string[];
}

// ─── Composables & stores ─────────────────────────────────────────────────────

const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();
const departementStore = useDepartementStore();
const toaster = useToaster();
const userStore = useUserStore();

const data = computed(() => demandeSejourStore.demandes as Data[]);
const total = computed(() => demandeSejourStore.totalDemandes ?? (0 as number));
const optionType = columnsTable.optionType;

const { query } = route;

const title = "Liste des séjours";

const draftStatus = statusUtils.defaultStatus.BROUILLON;
const enabledCopyStatus: string[] = [
  statusUtils.defaultStatus.BROUILLON,
  statusUtils.defaultStatus.TRANSMISE,
  statusUtils.defaultStatus.EN_COURS,
  statusUtils.defaultStatus.ANNULEE,
  statusUtils.defaultStatus.ABANDONNEE,
];

const enabledDeleteCancelStatus: string[] = [
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

const defs: [string, string, string][] = [
  ["idFonctionnelle", "Numéro de déclaration", optionType.SORTABLE],
  ["libelle", "Nom du séjour", optionType.SORTABLE],
  ["departementSuivi", "Dept", optionType.SORTABLE],
  ["siret", "Siret", optionType.SORTABLE],
  ["dateDebut", "Dates (Début-fin)", optionType.SORTABLE],
  ["statut", "Statut", optionType.SORTABLE],
  ["custom:edit", "Action", optionType.FIXED_RIGHT],
];

const columns: Columns<Data> = columnsTable.buildColumns(defs) as Columns<Data>;
const defaultStatus: string[] = [...Object.values(statusUtils.defaultStatus)];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const paramsToArray = (params: string | string[]): string[] =>
  Array.isArray(params) ? params : [params];

const defaultDepartements = computed(() =>
  departementStore.departements.map((d) => ({ label: d.text, value: d.value })),
);
const seasons: string[] = ["hiver", "printemps", "été", "automne"];

const idFonctionnelle = ref<string>(
  typeof query.idFonctionnelle === "string" ? query.idFonctionnelle : "",
);
const libelle = ref<string>(
  typeof query.libelle === "string" ? query.libelle : "",
);
const siret = ref<string>(typeof query.siret === "string" ? query.siret : "");
const departementSuivi = ref<string[]>([]);
const status = ref<string[]>(
  query.statut
    ? paramsToArray(query.statut as string | string[]).filter((s) =>
        defaultStatus.includes(s),
      )
    : [],
);
const season = ref<string[]>(
  query.periode
    ? paramsToArray(query.periode as string | string[]).filter((s) =>
        seasons.includes(s),
      )
    : [],
);
// Convert LocationQuery to Record<string, string>
const queryString: Record<string, string> = Object.fromEntries(
  Object.entries(query).map(([key, value]) => [
    key,
    Array.isArray(value)
      ? value.filter((v) => v != null).join(",")
      : value == null
        ? ""
        : String(value),
  ]),
);

const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
) as NestedKeys<object>[];

const { limit, offset, sort, sortDirection } = usePagination<object>(
  {
    limit: queryString.limit,
    offset: queryString.offset,
    sort: queryString.sort,
    sortDirection: queryString.sortDirection as "asc" | "desc" | "",
  },
  sortableColumns,
) as {
  limit: Ref<number>;
  offset: Ref<number>;
  sort: Ref<NestedKeys<Data> | "">;
  sortDirection: Ref<"asc" | "desc" | "">;
};

const getSearchParams = (): Partial<ApiQuery> => ({
  ...(isValidParams(idFonctionnelle.value)
    ? { idFonctionnelle: idFonctionnelle.value }
    : {}),
  ...(isValidParams(libelle.value) ? { libelle: libelle.value } : {}),
  ...(isValidParams(departementSuivi.value)
    ? { departementSuivi: departementSuivi.value }
    : {}),
  ...(isValidParams(status.value) ? { statut: status.value } : {}),
  ...(isValidParams(season.value) ? { periode: season.value } : {}),
});

let timeout: ReturnType<typeof setTimeout> | null = null;

const generateApiQuery = (): ApiQuery => ({
  limit: limit.value,
  offset: offset.value,
  ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
  ...(isValidParams(sortDirection.value)
    ? { sortDirection: sortDirection.value.toUpperCase() }
    : {}),
  ...getSearchParams(),
});

const updateData = (query?: ApiQuery): void => {
  demandeSejourStore.fetchDemandes(query ?? {});
};

const updateDataDebounced = (resetOffset = false): void => {
  if (resetOffset) {
    offset.value = 0;
  }
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    const query = generateApiQuery();
    updateData(query);
    navigateTo({ query: query as Record<string, string | string[]> });
  }, 300);
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});

const displayDate = (date: string | Date): string =>
  dayjs(date).format("DD/MM/YYYY");

const init = async (): Promise<void> => {
  await departementStore.fetch();
  departementSuivi.value = query.departementSuivi?.length
    ? paramsToArray(query.departementSuivi as string | string[]).filter((dep) =>
        defaultDepartements.value.some((d) => d.value === dep),
      )
    : [];
  const apiQuery = generateApiQuery();
  updateData(apiQuery);
};

init();

// ─── Actions ──────────────────────────────────────────────────────────────────

const popUpParams = ref<PopUpParams | null>(null);

const handleDuplication = (declarationId: string): void => {
  popUpParams.value = {
    cb: () => copyDS(declarationId),
    msg: "Duplication d'une déclaration",
  };
};

const handleRemoveClose = (declarationId: string, status: string): void => {
  if (status === draftStatus) {
    popUpParams.value = {
      cb: () => deleteDS(declarationId),
      msg: "Suppression d'une déclaration",
    };
  } else {
    popUpParams.value = {
      cb: () => cancelDS(declarationId),
      msg: "Annulation d'une déclaration",
    };
  }
};

const displayToasterError = (type: string): void => {
  toaster.error({
    titleTag: "h2",
    description: `Une erreur est survenue lors de ${type} de la déclaration de séjour`,
    role: "alert",
  });
};

const copyDS = async (declarationId: string): Promise<void> => {
  try {
    const response = await demandeSejourStore.copyDemandeSejour(declarationId);
    if (response.declarationId) {
      toaster.success({ titleTag: "h2", description: "Déclaration dupliquée" });
    } else {
      displayToasterError("la copie");
    }
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "data" in error &&
      (error as { data?: { name?: string } }).data?.name === "LibelleTooLong"
    ) {
      toaster.error({
        titleTag: "h2",
        description:
          "La duplication a échoué: le libellé de la déclaration copiée dépasse la limite de 100 caractères.",
        role: "alert",
      });
    } else {
      displayToasterError("la copie");
    }
  } finally {
    popUpParams.value = null;
  }
  updateData();
};

const deleteDS = async (declarationId: string): Promise<void> => {
  try {
    const response =
      await demandeSejourStore.deleteDemandeSejour(declarationId);
    if (response.deletedRows === 1) {
      toaster.success({ titleTag: "h2", description: "Déclaration supprimée" });
    } else {
      displayToasterError("la suppression");
    }
  } catch (error: Error | unknown) {
    displayToasterError("la suppression");
    throw error;
  } finally {
    popUpParams.value = null;
  }
  updateData();
};

const cancelDS = async (declarationId: string): Promise<void> => {
  try {
    const response =
      await demandeSejourStore.cancelDemandeSejour(declarationId);
    if (response.canceletedRows === 1) {
      toaster.success({ titleTag: "h2", description: "Déclaration annulée" });
    } else {
      displayToasterError("l'annulation");
    }
  } catch (error: unknown) {
    displayToasterError("l'annulation");
    throw error;
  } finally {
    popUpParams.value = null;
  }
  updateData();
};

const getCsv = async (): Promise<void> => {
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
