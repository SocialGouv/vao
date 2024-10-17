<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des Organismes</h1>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
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
                  @update:model-value="updateYearObtention"
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
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
    <TableFull
      :headers="headers"
      :data="organismeStore.organismes ?? []"
      :dict="dict"
      :search="search"
      @click-row="navigate"
    />
  </div>
</template>
<script setup>
import { TableFull } from "@vao/shared";

import dayjs from "dayjs";

definePageMeta({
  middleware: ["is-connected"],
});

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

// Appel du store à l'ouverture
organismeStore.fetchOrganismes({
  search,
});

const dict = {
  regionObtention: {
    obj: "agrement",
    val: "regionObtention",
  },
  yearObtention: {
    obj: "agrement",
    val: "yearObtention",
  },
};

const headers = [
  {
    column: "raisonSociale",
    text: "Raison sociale / Nom de la personne physique",
    format: (u) => u.raisonSociale || u.nomPersonnePhysique,
  },
  {
    column: "typeOrganisme",
    text: "Type",
    format: (u) => u.typeOrganisme?.replace("_", " "),
    sort: true,
  },
  {
    column: "editedAt",
    text: "Date de modification",
    format: (u) => dayjs(u.editedAt).format("DD/MM/YYYY HH:MM"),
    sort: true,
  },
  {
    column: "complet",
    text: "Complet",
    format: (u) => (u.complet ? "Oui" : "Non"),
    sort: true,
  },
  {
    column: "siret",
    text: "SIRET",
    sort: true,
  },
  {
    column: "agrement",
    objectLabel: "regionObtention",
    text: "Région d'agrément",
    sort: true,
  },
  {
    column: "agrement",
    objectLabel: "dateObtention",
    text: "Date d'obtention",
    sort: true,
  },
  {
    column: "sejourCount",
    text: "Nombre de séjours",
  },
];

const navigate = (organisme) => {
  navigateTo(`/organismes/${organisme.organismeId}`);
};
</script>
