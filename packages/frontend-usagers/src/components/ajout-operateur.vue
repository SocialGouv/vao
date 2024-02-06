<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-5">
        <span> Saisissez un numéro SIRET puis cliquez sur "Rechercher" </span>
      </div>
      <div class="fr-fieldset__element fr-col-5">
        <div class="fr-input-group">
          <DsfrInputGroup
            :error-message="siretField.errorMessage"
            :model-value="siretField.modelValue"
            type="text"
            label="Numéro SIRET"
            name="siret"
            :required="true"
            :label-visible="true"
            placeholder="Veuillez saisir un n° SIRET"
            :is-valid="siretField.isValid"
            @update:model-value="checkValidSiret"
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-2">
        <DsfrButton :disabled="!siretField.isValid" @click.prevent="fetchSiret"
          >Rechercher</DsfrButton
        >
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6"></div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6"></div>
    </fieldset>
  </div>
  <div v-if="listeDisplayed">
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-12">
        <span>Veuillez sélectionner une ligne en cliquant dessus :</span>
        <UtilsTableFullWithoutPagination
          :headers="headers"
          :selected="operateurSelected.value.nic ?? ''"
          index-to-compare="1"
          :data="operateurs"
          :row-navigate="navigate"
        ></UtilsTableFullWithoutPagination>
      </div>
    </fieldset>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            :model-value="operateurSelected.value.nic"
            :disabled="true"
            label="Code établissement"
            name="nicSelected"
            :label-visible="true"
            placeholder=""
          />
        </div>
      </div>
      <div class="fr-fieldset__element fr-col-6">
        <div class="fr-input-group">
          <DsfrInputGroup
            :model-value="operateurSelected.value.commune"
            :disabled="true"
            label="Commune"
            placeholder=""
            name="communeSelected"
            :label-visible="true"
          />
        </div>
      </div>
    </fieldset>
  </div>
  <fieldset class="fr-fieldset">
    <div class="fr-fieldset__element fr-col-6">
      <div class="fr-input-group">
        <DsfrButton :secondary="true" size="lg" @click="back"
          >Retour</DsfrButton
        >
      </div>
    </div>
    <div class="fr-fieldset__element fr-col-6">
      <div class="fr-input-group">
        <DsfrButton
          :disabled="!operateurSelected.value"
          size="lg"
          @click="SaveOperateur"
          >Ajouter</DsfrButton
        >
      </div>
    </div>
  </fieldset>
  <div class="fr-col-12">&nbsp;</div>
</template>

<script setup>
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("component/ajout-operateur");

const emit = defineEmits(["add", "back"]);

const operateurs = ref([]);
const siretRegex = /^[0-9]{14}$/;
const listeDisplayed = ref(false);
const headers = [
  {
    column: "siren",
    text: "N° SIREN",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nic",
    text: "Code Etab.",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "nom",
    format: (row) => row.uniteLegale.denominationUniteLegale,
    text: "Nom",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "adresse",
    format: (row) => {
      const adresse =
        (row.adresseEtablissement.numeroVoieEtablissement ?? "") +
        " " +
        (row.adresseEtablissement.typeVoieEtablissement ?? "") +
        " " +
        row.adresseEtablissement.libelleVoieEtablissement +
        " " +
        row.adresseEtablissement.codePostalEtablissement +
        " " +
        row.adresseEtablissement.libelleCommuneEtablissement;
      return adresse.trim();
    },
    text: "adresse",
  },
  {
    column: "codePostal",
    text: "Code Postal",
    headerAttrs: {
      class: "suivi",
    },
  },
  {
    column: "commune",
    text: "Commune",
    headerAttrs: {
      class: "suivi",
    },
  },
];
const siretField = reactive({
  errorMessage: "",
  modelValue: "",
  isValid: false,
});
const operateurSelected = reactive({});

function checkValidSiret(siret) {
  siretField.modelValue = siret;
  siretField.isValid = !siret || siretRegex.test(siret);
  siretField.errorMessage =
    !siret || siretField.isValid ? "" : "Ce numéro SIRET est invalide";
}

function navigate(item) {
  operateurSelected.value = {
    ...item,
    nic: item.nic,
    commune: item.adresseEtablissement.libelleCommuneEtablissement,
  };
}

function back() {
  emit("back", {});
}

async function fetchSiret() {
  log.i("fetchSiret - IN");
  listeDisplayed.value = true;
  operateurSelected.value = {};
  const siret = siretField.modelValue;
  try {
    await $fetch(`/front-server/siret/${siret}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        toaster.success("API Insee OK");
        operateurs.value = response.etablissements;
        listeDisplayed.value = true;
        log.d("fetchSiret", { response });
      })
      .catch((error) => {
        toaster.error("Achtung sur API Insee");
        const body = error.data;
        const codeError = body.code;
        log.w("fetchSiret", { body, codeError });
      });
  } catch (error) {
    log.w("fetchSiret", { error });
  } finally {
    log.i("fetchSiret - DONE");
  }
}

async function SaveOperateur() {
  log.i("SaveOperateur -IN");
  try {
    await $fetch("/front-server/operateurs", {
      method: "POST",
      body: {
        siren: operateurSelected.value.siren,
        siret: operateurSelected.value.siren + operateurSelected.value.nic,
        nom: operateurSelected.value.uniteLegale.denominationUniteLegale,
        adresse: (
          (operateurSelected.value.adresseEtablissement
            .numeroVoieEtablissement ?? "") +
          " " +
          (operateurSelected.value.adresseEtablissement.typeVoieEtablissement ??
            "") +
          " " +
          (operateurSelected.value.adresseEtablissement
            .libelleVoieEtablissement ?? "") +
          " " +
          (operateurSelected.value.adresseEtablissement
            .complementAdresseEtablissement ?? "")
        ).trim(),
        codePostal:
          operateurSelected.value.adresseEtablissement.codePostalEtablissement,
        commune:
          operateurSelected.value.adresseEtablissement
            .libelleCommuneEtablissement,
      },
    })
      .then((response) => {
        toaster.success("Sauvegarde opérateur OK");
        emit("add", response.operateurId);
      })
      .catch((error) => {
        log.w(error);
        toaster.error("Achtung sur SaveOperateur");
      });
  } catch (error) {
    log.w("SaveOperateur", { error });
  } finally {
    log.i("SaveOperateur - DONE");
  }
}
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
