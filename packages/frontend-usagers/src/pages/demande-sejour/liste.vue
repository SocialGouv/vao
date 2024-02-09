<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <form>
          <fieldset class="fr-fieldset">
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <label class="fr-label"> ID </label>
                <Multiselect
                  :model-value="search.id"
                  name="id"
                  mode="tags"
                  :searchable="true"
                  :close-on-select="false"
                  :options="idOptions"
                  @update:model-value="onUpdateId"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <DsfrInputGroup
                  v-model="search.siret"
                  type="text"
                  name="siret"
                  label="SIRET"
                  placeholder="n° siret"
                  :label-visible="true"
                />
              </div>
            </div>

            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <label class="fr-label"> Département d'instruction </label>
                <Multiselect
                  :model-value="search.departement"
                  :searchable="true"
                  :close-on-select="false"
                  value-prop="code"
                  label="label"
                  mode="tags"
                  :options="departementOptions"
                  @update:model-value="onUpdateDepartement"
                />
              </div>
            </div>
            <div
              class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-3 fr-col-lg-2"
            >
              <div class="fr-input-group">
                <label class="fr-label"> Statut</label>
                <Multiselect
                  :model-value="search.statut"
                  :hide-selected="true"
                  :searchable="false"
                  :close-on-select="false"
                  mode="tags"
                  name="statut"
                  :options="statutOptions"
                  @update:model-value="onUpdateStatut"
                />
              </div>
            </div>
          </fieldset>
        </form>
      </div>
    </div>

    <UtilsTableFull
      :headers="headers"
      :data="demandeSejourStore.demandes"
      :search="search"
      :row-navigate="navigate"
    ></UtilsTableFull>
    <!--<fieldset class="fr-fieldset">
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-6 fr-col-lg-3"
      >
        <DsfrButton label="Ajouter cadre interdit" @click="addCadreInterdit" />
      </div>
      <div
        class="fr-fieldset__element fr-fieldset__element--inline fr-col-12 fr-col-md-6 fr-col-lg-3"
      >
        <DsfrButton label="Exporter au format CSV" @click="exportArretes" />
      </div>
    </fieldset> -->
  </div>
</template>

<script setup>
// import dayjs from "dayjs";
import Multiselect from "@vueform/multiselect";

import "@vueform/multiselect/themes/default.css";

import { useDepartementStore } from "~/stores/referentiels";
import { useDemandeSejourStore } from "~/stores/demande-sejour";
// import { useUserStore } from "@/stores/userStore";
// import { roles } from "@/helpers/roles";

// const DsfrButton = resolveComponent("DsfrButton");
// const nuxtApp = useNuxtApp();
// const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/demande-sejour/liste");

definePageMeta({
  middleware: ["is-connected"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Liste des demandes",
  },
];

const navigate = (item) => {
  navigateTo(`/demande-sejour/operateur/${item.demandeSejourId}`);
};

const search = reactive({
  id: null,
  siret: null,
  statut: null,
  departement: null,
});

const departementStore = useDepartementStore();
const demandeSejourStore = useDemandeSejourStore();

const idOptions = computed(() => {
  return demandeSejourStore.demandes
    .map((d) => d.demandeSejourId)
    .filter((v, i, a) => a.indexOf(v) === i);
});

const departementOptions = computed(() => {
  return departementStore.departements.map((d) => {
    return { label: d.text, value: d.value };
  });
});

const statutOptions = computed(() => {
  return [
    { label: "BROUILLON", value: "BROUILLON" },
    { label: "TRANMISE", value: "TRANMISE" },
    { label: "EN COURS", value: "EN COURS" },
    { label: "A MODIFIER", value: "A MODIFIER" },
    {
      label: "EN ATTENTE VALIDATION HEBERGEMENT",
      value: "EN ATTENTE VALIDATION HEBERGEMENT",
    },
    {
      label: "EN ATTENTE DECLARATION 8 JOURS",
      value: "EN ATTENTE DECLARATION 8 JOURS",
    },
    { label: "VALIDEE", value: "VALIDEE" },
    { label: "REFUSEE", value: "REFUSEE" },
  ];
});

const onUpdateId = (id) => {
  search.id = id;
};

const onUpdateDepartement = (d) => {
  search.departement = d;
};

const onUpdateStatut = (s) => {
  search.statut = s;
};

const headers = [
  {
    column: "demandeSejourId",
    sorter: "demandeSejourId",
    text: "Id",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "siret",
    text: "N° SIRET",
    sorter: "siret",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "libelle",
    text: "Titre",
    sorter: "libelle",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "statut",
    sorter: "statut",
    text: "Statut",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "editedAt",
    sorter: "editedAt",
    text: "Date de modification",

    headerAttrs: {
      class: "suivi",
    },
  },
];

onMounted(async () => {
  log.i("mounted");
  await departementStore.fetch();
  await demandeSejourStore.fetchDemandes();
});
</script>

<style>
th.suivi {
  cursor: pointer;
}
</style>
