<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-col-12">
        <span>Veuillez sélectionner une ligne en cliquant dessus :</span>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrInputGroup
            :model-value="selectedOperateur?.personneMorale?.siret"
            :disabled="true"
            label="Numéro SIRET"
            name="siretSelected"
            :label-visible="true"
            placeholder=""
          />
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrInputGroup
            :model-value="selectedOperateur?.personneMorale?.nom"
            :disabled="true"
            label="Dénomination"
            placeholder=""
            name="nomSelected"
            :label-visible="true"
          />
        </div>
      </div>
      <div class="fr-col-4">
        <div class="fr-input-group">
          <DsfrInputGroup
            :model-value="selectedOperateur?.personneMorale?.commune"
            :disabled="true"
            label="Commune"
            placeholder=""
            name="communeSelected"
            :label-visible="true"
          />
        </div>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <UtilsTableFullWithoutPagination
        :headers="headers"
        :data="operateurs"
        :selected="selectedOperateur?.personneMorale?.siren ?? ''"
        index-to-compare="0"
        :row-navigate="navigate"
      ></UtilsTableFullWithoutPagination>
    </fieldset>
  </div>
</template>

<script setup>
import { useOperateurStore } from "@/stores/operateur";
import { useLayoutStore } from "@/stores/layout";
import "@vueform/multiselect/themes/default.css";
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/operateur/liste");

definePageMeta({
  middleware: ["is-connected"],
  layout: "operateur",
});

const operateurStore = useOperateurStore();
const layoutStore = useLayoutStore();

const headers = [
  {
    column: "personneMorale",
    format: (row) => row.personneMorale.siren,
    text: "N° SIREN",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nic",
    format: (row) => row.personneMorale.siret.substring(9, 14),
    text: "Code Etab.",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nom",
    format: (row) => row.personneMorale.nom,
    text: "Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "adresse",
    format: (row) => row.personneMorale.adresse,
    text: "Adresse",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "codePostal",
    format: (row) => row.personneMorale.codePostal,
    text: "Code Postal",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "commune",
    format: (row) => row.personneMorale.commune,
    text: "Commune",
    headerAttrs: {
      class: "suivi",
    },
  },
];

const operateurs = computed(() => operateurStore.operateurs ?? []);

const lineSelected = ref({});

const selectedOperateur = computed(() => {
  return lineSelected.value;
});

function navigate(item) {
  lineSelected.value = operateurs.value.find(
    (o) => o.operateurId === item.operateurId
  );
}

onMounted(async () => {
  await operateurStore.fetchOperateurs();
  layoutStore.displaySideMenu = false;
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
