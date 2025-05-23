<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des comptes organisateurs</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <div class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.nom"
                  type="text"
                  name="nom"
                  label="Nom"
                  placeholder="Nom"
                  :label-visible="true"
                  @update:model-value="updateData"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.prenom"
                  type="text"
                  name="prenom"
                  label="Prénom"
                  placeholder="Prénom"
                  :label-visible="true"
                  @update:model-value="updateData"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.email"
                  type="mail"
                  name="mail"
                  label="Adresse courriel"
                  placeholder="Adresse courriel"
                  :label-visible="true"
                  @update:model-value="updateData"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="searchState.organisme"
                  type="organisme"
                  name="organisme"
                  label="Organisme"
                  placeholder="Organisme"
                  :label-visible="true"
                  @update:model-value="updateData"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <DsfrDataTableV2Wrapper
      v-model:limit="limit"
      v-model:offset="offset"
      v-model:sort="sort"
      v-model:sort-direction="sortDirection"
      :columns="columns"
      :table-title="`Liste des comptes organisateurs (${usersStore.totalUsersFO})`"
      :data="usersStore.usersFO"
      :total="usersStore.totalUsersFO"
      row-id="organismeId"
      is-sortable
      @update-data="updateData"
    >
      <template #cell-statut="{ cell }">
        {{ mapStatutToLabel(cell) }}
      </template>
      <template #cell-dateCreation="{ cell }">
        {{ getDateCreationLabel(cell) }}
      </template>
      <template #cell-custom-edit="{ row }">
        <NuxtLink
          :to="`/organismes/${row.organismeId}`"
          title="Naviguer vers l'organisme"
          class="no-background-image"
        >
          <DsfrButton
            icon="ri:arrow-right-s-line"
            icon-only
            primary
            size="small"
            type="button"
          />
        </NuxtLink>
      </template>
    </DsfrDataTableV2Wrapper>
    <div class="fr-input-group">
      <DsfrButton
        type="button"
        label="Extraire en CSV"
        primary
        @click="getCsvUtilisateurs"
      />
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { DsfrDataTableV2Wrapper } from "@vao/shared";
import { useUserStore } from "~/stores/user";

definePageMeta({
  middleware: ["is-connected"],
});
const usersStore = useUserStore();
const route = useRoute();
const { query } = route;

const getCsvUtilisateurs = async () => {
  const response = await usersStore.exportUsersOrganismes();
  exportCsv(response, "UtilisateursOrganismes.csv");
};

const columns = [
  {
    key: "nom",
    label: "Nom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "prenom",
    label: "Prenom",
    options: {
      isSortable: true,
    },
  },
  {
    key: "email",
    label: "Adresse courriel",
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
    key: "dateCreation",
    label: "Date de création",
    options: {
      isSortable: true,
    },
  },
  {
    key: "raisonSociale",
    label: "Raison sociale",
    options: {
      isSortable: true,
    },
  },
  {
    key: "nombreDeclarations",
    label: "Déclarations de séjour",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom-edit",
    label: "Action",
    options: {
      isFixedRight: true,
    },
  },
];
const sortableColumns = columns.flatMap((column) =>
  column.options?.isSortable ? [column.key] : [],
);

const mapStatutToLabel = (statut) => {
  return {
    VALIDATED: "Validé",
    NEED_EMAIL_VALIDATION: "En attente activation",
    NEED_SIRET_VALIDATION: "En attente validation SIRET",
    BLOCKED: "Bloqué",
  }[statut];
};
const getDateCreationLabel = (date) => dayjs(date).format("DD/MM/YYYY HH:MM");

const searchState = reactive({
  nom: null,
  prenom: null,
  email: null,
  organisme: null,
});

const defaultLimit = 10;
const defaultOffset = 0;
const limit = ref(parseInt(query.limit, 10) || defaultLimit);
const offset = ref(parseInt(query.offset, 10) || defaultOffset);
const sort = ref(sortableColumns.includes(query.sort) ? query.sort : "");
const sortDirection = ref(
  ["", "asc", "desc"].includes(query.sortDirection) ? query.sortDirection : "",
);

usersStore.fetchUsersOrganisme({
  limit: limit.value,
  offset: offset.value,
});

const isValidParams = (params) =>
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);

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
      search: searchState,
    };

    usersStore.fetchUsersOrganisme(query);
    navigateTo({
      query: {
        limit: limit.value,
        offset: offset.value,
        ...(isValidParams(sort.value) ? { sortBy: sort.value } : {}),
        ...(isValidParams(sortDirection.value)
          ? { sortDirection: sortDirection.value }
          : {}),
        ...searchState,
      },
    });
  }, 300);
};

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>
