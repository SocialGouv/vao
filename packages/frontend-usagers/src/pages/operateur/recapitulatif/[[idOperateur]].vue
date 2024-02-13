<template>
  <div>
    <fieldset class="fr-fieldset">
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Renseignements généraux :</span>
          <DsfrBadge
            :label="renseignementsGeneraux.label"
            :small="true"
            :type="renseignementsGeneraux.type"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Agrément :</span>
          <DsfrBadge
            :label="agrement.label"
            :small="true"
            :type="agrement.type"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Protocole transport :</span>
          <DsfrBadge
            :label="protocoleTransport.label"
            :small="true"
            :type="protocoleTransport.type"
          />
        </div>
      </div>
      <div class="fr-fieldset__element">
        <div class="fr-input-group fr-col-12">
          <span>Protocole sanitaire :</span>
          <DsfrBadge
            :label="protocoleSanitaire.label"
            :small="true"
            :type="protocoleSanitaire.type"
          />
        </div>
      </div>
    </fieldset>
    <div class="fr-fieldset__element">
      <div class="fr-input-group fr-col-12">
        <DsfrButton
          label="Finaliser la fiche opérateur"
          :disabled="
            !protocoleSanitaire.type === 'success' ||
            !protocoleTransport.type === 'success' ||
            !agrement.type === 'success'
          "
          @click="saveOperateur"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLayoutStore } from "@/stores/layout";
import { useOperateurStore } from "@/stores/operateur";

definePageMeta({
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur",
});

const log = logger("pages/operateur/protocole-transport");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const route = useRoute();

const layoutStore = useLayoutStore();
const operateurStore = useOperateurStore();

const renseignementsGeneraux = ref({
  label: "complet",
  type: "success",
});
const agrement = ref({
  label: "",
  type: "",
});
const protocoleTransport = ref({
  label: "",
  type: "",
});
const protocoleSanitaire = ref({
  label: "",
  type: "",
});
async function saveOperateur() {
  log.i("saveOperateur - IN");
  try {
    const url = `/front-server/operateur/${route.params.idOperateur}`;
    const { data, error } = await useFetch(url, {
      method: "POST",
      body: {
        parametre: {},
        type: "recapitulatif",
      },
    });
    if (data.value) {
      const url = `/`;

      toaster.success("Fiche opérateur validée");
      navigateTo(url);
    }
    if (error.value) {
      log.w(error.value);
      toaster.error(`une erreur est survenue : ${error.value}`);
    }
  } catch (error) {
    log.w("Validation d'operateur - erreur", { error });
  }
}

onMounted(async () => {
  layoutStore.stepperIndex = 5;
  await operateurStore.setMyOperateur();
  if (operateurStore.operateurCourant.agrement) {
    agrement.value.label = "complet";
    agrement.value.type = "success";
  } else {
    agrement.value.label = "à compléter";
    agrement.value.type = "warning";
  }
  if (operateurStore.operateurCourant.protocoleTransport.meta) {
    protocoleTransport.value.label = "complet";
    protocoleTransport.value.type = "success";
  } else {
    protocoleTransport.value.label = "à compléter";
    protocoleTransport.value.type = "warning";
  }
  if (operateurStore.operateurCourant.protocoleSanitaire.meta) {
    protocoleSanitaire.value.label = "complet";
    protocoleSanitaire.value.type = "success";
  } else {
    protocoleSanitaire.value.label = "à compléter";
    protocoleSanitaire.value.type = "warning";
  }
  log.d("mounted Done");
});
</script>

<style lang="scss" scoped></style>
