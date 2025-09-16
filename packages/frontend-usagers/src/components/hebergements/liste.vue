<template>
  <HebergementsFilters
    v-model:nom="nom"
    v-model:adresse="adresse"
    v-model:statut="statut"
    :status-filtre="status"
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
    row-id="id"
    is-sortable
    @update-data="updateData"
  >
    <template #cell-custom:name="{ row }">
      {{ row.nom }}
    </template>
    <template #cell-departement:label="{ row }">
      {{
        row.departement
          ? departementStore.departements.find(
              ({ value }) => value === row.departement,
            )?.text
          : "Inconnu"
      }}
    </template>
    <template #cell-statut="{ cell }">
      <div>
        <HebergementStatusBadge :statut="cell" />
      </div>
    </template>
    <template #cell-custom:edit="{ row }">
      <div class="buttons-group">
        <NuxtLink
          :to="`/hebergements/${row.id}`"
          :title="`Naviguer vers l'hébergement: ${row.nom}`"
          class="fr-btn fr-btn--sm inline-flex justify-center no-background-image"
        >
          <span class="fr-icon-arrow-right-s-line" aria-hidden="true"></span>
          <span class="fr-sr-only"
            >Naviguer vers l'hébergement: {{ row.nom }}</span
          >
        </NuxtLink>
        <DsfrButton
          v-if="
            canDesactivateOrReactivate &&
            [statuts.ACTIF, statuts.DESACTIVE].includes(row.statut)
          "
          class="button--danger"
          :icon="
            row.statut === statuts.DESACTIVE
              ? 'ri:lock-unlock-line'
              : 'ri:lock-line'
          "
          icon-only
          secondary
          size="small"
          type="button"
          :aria-label="
            row.statut === statuts.DESACTIVE
              ? `Réactiver l'hébergement: ${row.nom}`
              : `Désactiver l'hébergement: ${row.nom}`
          "
          :label="
            row.statut === statuts.DESACTIVE
              ? 'Réactiver l\'hébergement'
              : 'Désactiver l\'hébergement'
          "
          @click="desactivateOrReactivate(row)"
        />
      </div>
    </template>
  </DsfrDataTableV2Wrapper>
</template>

<script setup>
import { DsfrDataTableV2Wrapper } from "@vao/shared";
import HebergementStatusBadge from "./HebergementStatusBadge.vue";
const toaster = useToaster();

const hebergementStore = useHebergementStore();
const departementStore = useDepartementStore();
const organismeStore = useOrganismeStore();
const route = useRoute();

const data = computed(() => hebergementStore.hebergements);
const total = computed(() => hebergementStore.hebergementsTotal);
const { query } = route;

const status = hebergements.statutsValues;
const statuts = hebergements.statuts;

organismeStore.setMyOrganisme();

const canDesactivateOrReactivate = ref(() => {
  return (
    organismeStore.isSiegeSocial ||
    organismeStore?.organismeCourant.typeOrganisme === "personne_physique"
  );
});

const columns = [
  {
    key: "nom",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "departement:label",
    label: "Département",
  },
  {
    key: "adresse",
    label: "Adresse",
  },
  {
    key: "statut",
    label: "Statut",
  },
  {
    key: "custom:edit",
    label: "Action",
    options: {
      isFixedRight: true,
    },
  },
];
const title = "Liste des Hébergements";
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
departementStore.fetch();

async function desactivateOrReactivate(row) {
  const hebergementId = row.id;
  if (row.statut === statuts.ACTIF) {
    try {
      await hebergementStore.desactivate(hebergementId);
      toaster.success({
        titleTag: "h2",
        description: "Hébergement " + row.nom + " désactivé avec succès",
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description:
          error.data.message ??
          "Erreur lors de la désactivation de l'hébergement" + row.nom,
      });
      throw error;
    }
  } else {
    try {
      await hebergementStore.reactivate(hebergementId);
      toaster.success({
        titleTag: "h2",
        description: "Hébergement " + row.nom + " réactivé avec succès",
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description:
          error.data.message ??
          "Erreur lors de la réactivation de l'hébergement" + row.nom,
      });
      throw error;
    }
  }
  updateData();
}

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
      ...getSearchParams(),
    };
    hebergementStore.fetch(query);
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
updateData();
onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
<style scoped>
.buttons-group {
  display: flex;
  gap: 0.5rem;
}
.buttons-group > .fr-btn {
  height: 100%;
}
</style>
