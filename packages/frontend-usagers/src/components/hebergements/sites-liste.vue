<template>
  <HebergementsFilters
    v-model:nom="nom"
    v-model:adresse="adresse"
    v-model:statut="statut"
    :status-filtre="status"
    @filters-update="() => updateData(true)"
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
    row-id="id"
    is-sortable
    @update-data="() => updateData()"
  >
    <template #cell-custom:edit="{ row }">
      <!--
        Lien temporaire : la page /hebergements/sites/{siteId} (fiche détaillée du
        site) est HORS scope du ticket 1495. Le lien est simplement posé pour le
        futur ; la destination n'est pas encore disponible à ce stade.
      -->
      <NuxtLink
        class="fr-btn fr-btn--secondary fr-btn--sm inline-flex"
        :to="`/hebergements/sites/${row.siteId}`"
        :title="
          row.statut === statuts.BROUILLON
            ? `Finaliser la fiche du site: ${row.nom}`
            : `Voir le détail du site: ${row.nom}`
        "
      >
        {{
          row.statut === statuts.BROUILLON
            ? "Finaliser la fiche"
            : "Voir le détail"
        }}
      </NuxtLink>
    </template>
    <template #cell-statut="{ row }">
      <DsfrToggleSwitch
        v-if="
          canDesactivateOrReactivate &&
          [statuts.ACTIF, statuts.DESACTIVE].includes(row.statut)
        "
        :model-value="row.statut === statuts.ACTIF"
        inactive-text="Désactivé"
        @update:model-value="() => desactivateOrReactivate(row)"
      />
      <HebergementStatusBadge
        v-else-if="row.statut === statuts.BROUILLON"
        :statut="row.statut"
      />
    </template>
  </DsfrDataTableV2Wrapper>
</template>

<script setup>
import { DsfrToggleSwitch } from "@gouvminint/vue-dsfr";
import {
  DsfrDataTableV2Wrapper,
  columnsTable,
  useToaster,
} from "@vao/shared-ui";
import HebergementStatusBadge from "./HebergementStatusBadge.vue";
import hebergements from "~/utils/hebergements";
const toaster = useToaster();

const hebergementStore = useHebergementStore();
const organismeStore = useOrganismeStore();
const route = useRoute();

const data = computed(() => hebergementStore.sites);
const total = computed(() => hebergementStore.sitesTotal);
const { query } = route;

const status = hebergements.statutsValues;
const statuts = hebergements.statuts;
const optionType = columnsTable.optionType;

organismeStore.setMyOrganisme();

const canDesactivateOrReactivate = computed(
  () =>
    organismeStore.isSiegeSocial ||
    organismeStore.organismeCourant?.typeOrganisme === "personne_physique",
);

const defs = [
  ["nom", "Nom", optionType.SORTABLE],
  ["adresse", "Adresse", optionType.SORTABLE],
  ["custom:edit", "Action", optionType.NONE],
  ["statut", "Statut", optionType.SORTABLE],
];

const columns = columnsTable.buildColumns(defs);

const title = "Liste des Sites";
const sortablecolumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);
const nom = ref(query.nom ?? "");
const adresse = ref(query.adresse ?? "");
const statut = ref(query.statut ?? "");
const limit = ref(parseInt(query.limit, 10) || 10);
const offset = ref(parseInt(query.offset, 10) || 0);
const sort = ref(sortablecolumns.includes(query.sort) ? query.sort : "");
const sortDirection = ref(
  ["", "asc", "desc"].includes(query.sortDirection) ? query.sortDirection : "",
);
const isValidParams = (params) =>
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);
const getSearchParams = () => ({
  ...(isValidParams(nom.value) ? { nom: nom.value } : {}),
  ...(isValidParams(adresse.value) ? { adresse: adresse.value } : {}),
  ...(isValidParams(statut.value) ? { statut: statut.value } : {}),
});
let timeout = null;

async function desactivateOrReactivate(row) {
  const siteId = row.id;
  if (row.statut === statuts.ACTIF) {
    try {
      await hebergementStore.desactivate(siteId);
      toaster.success({
        titleTag: "h2",
        description: "Site " + row.nom + " désactivé avec succès",
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description:
          error?.data?.message ??
          "Erreur lors de la désactivation du site" + row.nom,
        role: "alert",
      });
      throw error;
    }
  } else {
    try {
      await hebergementStore.reactivate(siteId);
      toaster.success({
        titleTag: "h2",
        description: "Site " + row.nom + " réactivé avec succès",
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description:
          error?.data?.message ??
          "Erreur lors de la réactivation du site" + row.nom,
        role: "alert",
      });
      throw error;
    }
  }
  updateData();
}

const updateData = (resetOffset = false) => {
  if (resetOffset) {
    offset.value = 0;
  }
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(() => {
    hebergementStore.fetchSites(buildQuery());
    navigateTo({
      query: buildQuery(),
    });
  }, 300);
};

const buildQuery = () => ({
  limit: limit.value,
  offset: offset.value,
  ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
  ...(isValidParams(sortDirection.value)
    ? { sortDirection: sortDirection.value.toUpperCase() }
    : {}),
  ...getSearchParams(),
});
updateData();
onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
