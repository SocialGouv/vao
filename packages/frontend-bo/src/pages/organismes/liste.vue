<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des Organismes</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <div class="fr-fieldset">
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-2 fr-col-lg-2"
          >
            <div class="fr-input-group">
              <DsfrInputGroup
                v-model="search.siret"
                type="text"
                name="SIRET"
                label="SIRET"
                placeholder="numéro SIREN ou SIREN"
                :label-visible="true"
                @update:model-value="updateData"
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
          >
            <div class="fr-input-group">
              <DsfrInputGroup
                v-model="search.raisonSociale"
                type="text"
                name="Raison sociale"
                placeholder="Raison sociale"
                label="Raison sociale"
                :label-visible="true"
                @update:model-value="updateData"
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-3"
          >
            <div class="fr-input-group">
              <DsfrInputGroup
                v-model="search.nomPersonnePhysique"
                type="text"
                name="nom"
                label="Nom"
                placeholder="Nom personne physique"
                :label-visible="true"
                @update:model-value="updateData"
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-2 fr-col-lg-2"
          >
            <div class="fr-input-group">
              <DsfrSelect
                name="yearObtention"
                label="Date d’obtention de l’agrément"
                :options="years"
                @update:model-value="
                  (value) => {
                    console.log(value);
                    updateYearObtention(value);
                    updateData();
                  }
                "
              />
            </div>
          </div>
          <div
            class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-2 fr-col-lg-2"
          >
            <div class="fr-input-group">
              <DsfrSelect
                v-model="search.regionObtention"
                name="regionObtention"
                label="Région d’obtention de l’agrément"
                :options="regions"
                @update:model-value="updateData"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <DsfrDataTableV2Wrapper
      v-model:limit="limit"
      v-model:offset="offset"
      v-model:sort="sortBy"
      v-model:sort-direction="sortDirection"
      :titles="titles"
      table-title="Liste des organismes"
      :data="organismeStore.organismes"
      :total="organismeStore.total"
      row-id="organismeId"
      is-sortable
      @update-data="updateData"
    >
      <template #cell:raisonSociale="{ row }">
        {{ row.raisonSociale || row.nomPersonnePhysique }}
      </template>
      <template #cell:typeOrganisme="{ row }">
        {{ row.typeOrganisme?.replace("_", " ") }}
      </template>
      <template #cell:editedAt="{ row }">
        {{ dayjs(row.editedAt).format("DD/MM/YYYY HH:MM") }}
      </template>
      <template #cell:complet="{ row }">
        {{ row.complet ? "Oui" : "Non" }}
      </template>
      <template #cell:regionObtention="{ row }">
        {{ row.agrement?.regionObtention }}
      </template>
      <template #cell:agrementDateObtention="{ row }">
        {{
          row.agrement?.dateObtention
            ? dayjs(row.agrement.dateObtention).format("DD/MM/YYYY")
            : null
        }}
      </template>
      <template #cell:custom-edit="{ row }">
        <DsfrButton
          label="Naviguer vers l'organisme"
          icon="ri:arrow-right-s-line"
          icon-only
          primary
          size="small"
          type="button"
          @click="navigate(row)"
        />
      </template>
    </DsfrDataTableV2Wrapper>
    <DsfrButton type="button" label="Extraire en CSV" primary @click="getCsv" />
  </div>
</template>
<script setup>
import { DsfrDataTableV2Wrapper } from "@vao/shared";

import dayjs from "dayjs";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const { query } = route;

const organismeStore = useOrganismeStore();
const regionStore = useRegionStore();

regionStore.fetch();

const regions = computed(() =>
  [{ text: "Toutes", value: "" }].concat(regionStore.regions),
);

const getLast20Years = () => {
  const currentYear = new Date().getFullYear();
  const years = ["Toutes les années"];

  for (let i = 0; i < 20; i++) {
    years.push(currentYear - i);
  }

  return years;
};

const years = getLast20Years();

const search = reactive({
  nomPersonnePhysique: null,
  siret: null,
  raisonSociale: null,
  yearObtention: null,
  regionObtention: null,
});

const updateYearObtention = (value) => {
  if (value === "Toutes les années") {
    search.yearObtention = null;
  } else {
    search.yearObtention = value;
  }
};

const titles = [
  {
    key: "raisonSociale",
    label: "Raison sociale / Nom de la personne physique",
  },
  {
    key: "typeOrganisme",
    label: "Type",
    options: {
      isSortable: true,
    },
  },
  {
    key: "editedAt",
    label: "Date de modification",
    options: {
      isSortable: true,
    },
  },
  {
    key: "complet",
    label: "Complet",
    options: {
      isSortable: true,
    },
  },
  {
    key: "siret",
    label: "SIRET",
    options: {
      isSortable: true,
    },
  },
  {
    key: "regionObtention",
    label: "Région d'agrément",
    options: {
      isSortable: true,
    },
  },
  {
    key: "agrementDateObtention",
    label: "Date d'obtention",
    options: {
      isSortable: true,
    },
  },
  {
    key: "sejourCount",
    label: "Nombre de séjours",
    options: {
      isSortable: true,
    },
  },
  {
    key: "custom-edit",
    label: "Action",
  },
];

const defaultLimit = 10;
const defaultOffset = 0;
const limit = ref(parseInt(query.limit, 10) || defaultLimit);
const offset = ref(parseInt(query.offset, 10) || defaultOffset);
const sortBy = ref(query.sortBy ?? "editedAt");
const sortDirection = ref(
  ["", "asc", "desc"].includes(query.sortDirection) ? query.sortDirection : "",
);

organismeStore.fetchOrganismes({
  limit: limit.value,
  offset: offset.value,
  sortBy: sortBy.value,
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
      ...(isValidParams(sortBy.value) ? { sortBy: sortBy.value } : {}),
      ...(isValidParams(sortDirection.value)
        ? { sortDirection: sortDirection.value.toUpperCase() }
        : {}),
      search,
    };
    organismeStore.fetchOrganismes(query);
    navigateTo({
      query: {
        limit: limit.value,
        offset: offset.value,
        ...(isValidParams(sortBy.value) ? { sortBy: sortBy.value } : {}),
        ...(isValidParams(sortDirection.value)
          ? { sortDirection: sortDirection.value }
          : {}),
        ...search,
      },
    });
  }, 300);
};

const getCsv = async () => {
  const response = await organismeStore.exportOrganismes();
  exportCsv(response, "organismes.csv");
};

const navigate = (organisme) => {
  navigateTo(`/organismes/${organisme.organismeId}`);
};
</script>
