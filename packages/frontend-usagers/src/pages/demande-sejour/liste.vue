<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <template v-if="demandeSejourStore.demandes.length">
      <div class="fr-grid-row">
        <div class="fr-col">
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
                  <label class="fr-label"> N° enregistrement </label>
                  <Multiselect
                    :model-value="search.idFonctionnelle"
                    name="idFonctionnelle"
                    mode="tags"
                    :searchable="true"
                    :close-on-select="false"
                    :options="idFonctionnellesOptions"
                    @update:model-value="onUpdateIdFonctionnelle"
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
                    :model-value="search.departementSuivi"
                    :searchable="true"
                    :close-on-select="false"
                    value-prop="value"
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
      <div class="fr-grid-row">
        <div class="fr-col">
          <UtilsTableFull
            :headers="headers"
            :data="demandeSejourStore.demandes"
            :search="search"
            :row-navigate="navigate"
          ></UtilsTableFull>
        </div>
      </div>
    </template>
    <p v-else>Aucune demande de séjour déclarée actuellement</p>
    <div class="fr-grid-row">
      <div class="fr-col">
        <form>
          <fieldset class="fr-fieldset">
            <DsfrButton>
              <NuxtLink to="/demande-sejour">
                Déclarer un nouveau séjour
              </NuxtLink>
            </DsfrButton>
          </fieldset>
        </form>
      </div>
    </div>
  </div>
</template>
<script setup>
import dayjs from "dayjs";
import Multiselect from "@vueform/multiselect";
const NuxtLink = resolveComponent("NuxtLink");
const DsfrBadge = resolveComponent("DsfrBadge");
import "@vueform/multiselect/themes/default.css";

import { useDepartementStore } from "~/stores/referentiels";
import { useDemandeSejourStore } from "~/stores/demande-sejour";

definePageMeta({
  middleware: ["is-connected"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Liste des déclarations",
  },
];

useHead({
  title: "VAO - mes déclarations de séjour",
  meta: [
    {
      name: "description",
      content: "Page listant les déclarations de séjour.",
    },
  ],
});
const navigate = (item) => {
  navigateTo(`/demande-sejour/${item.demandeSejourId}`);
};

const search = reactive({
  id: null,
  idFonctionnelle: null,
  siret: null,
  statut: null,
  departementSuivi: null,
});

const departementStore = useDepartementStore();
const demandeSejourStore = useDemandeSejourStore();

const idOptions = computed(() => {
  return demandeSejourStore.demandes
    .map((d) => d.demandeSejourId)
    .filter((v, i, a) => a.indexOf(v) === i);
});

const idFonctionnellesOptions = computed(() => {
  return demandeSejourStore.demandes
    .filter((v) => v.idFonctionnelle)
    .map((d) => d.idFonctionnelle)
    .filter((v, i, a) => a.indexOf(v) === i);
});
const departementOptions = computed(() => {
  return departementStore.departements.map((d) => {
    return { label: d.text, value: d.value };
  });
});

const statutOptions = [
  { label: "BROUILLON", value: "BROUILLON" },
  { label: "TRANSMISE", value: "TRANSMISE" },
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

const onUpdateId = (id) => {
  search.id = id;
};

const onUpdateIdFonctionnelle = (id) => {
  search.idFonctionnelle = id;
};

const onUpdateDepartement = (d) => {
  search.departementSuivi = d;
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
    column: "idFonctionnelle",
    sorter: "idFonctionnelle",
    text: "N° enregistrement",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "departementSuivi",
    sorter: "departementSuivi",
    text: "Département instructeur",
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
    column: "periode",
    text: "Saison",
    sorter: "periode",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateDebut",
    text: "Date de début",
    sorter: "dateDebut",
    format: (value) => dayjs(value.dateDebut).format("DD/MM/YYYY"),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "dateFin",
    text: "Date de fin",
    sorter: "dateFin",
    format: (value) => dayjs(value.dateFin).format("DD/MM/YYYY"),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "statut",
    sorter: "statut",
    text: "Statut",
    format: (value) => ({
      component: DsfrBadge,
      label: value.statut,
      noIcon: true,
      type: ["TRANSMISE", "EN COURS"].includes(value.statut)
        ? "success"
        : ["BROUILLON"].includes(value.statut)
          ? "info"
          : "",
    }),
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "editedAt",
    sorter: "editedAt",
    format: (value) => dayjs(value.editedAt).format("DD/MM/YYYY HH:mm"),
    text: "Date de modification",

    headerAttrs: {
      class: "suivi",
    },
  },
];

departementStore.fetch();
demandeSejourStore.fetchDemandes();
</script>

<style>
th.suivi {
  cursor: pointer;
}
</style>
