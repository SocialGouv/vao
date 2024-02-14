<template>
  <div>
    <div class="fr-fieldset__element">
      <div class="fr-input-group fr-col-8">
        <protocole-sanitaire
          :init-data="operateurStore.operateurCourant.protocoleSanitaire ?? {}"
          @valid="saveOperateur"
        ></protocole-sanitaire>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLayoutStore } from "@/stores/layout";
import { useOperateurStore } from "@/stores/operateur";

definePageMeta({
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur"
});


const log = logger("pages/operateur/protocole-sanitaire");
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const route = useRoute();

const layoutStore = useLayoutStore();
const operateurStore = useOperateurStore();

async function saveOperateur(transportData) {
  log.i("saveOperateur - IN");
  try {
    const url = `/operateur/${route.params.idOperateur}`;
    const { data, error } = await useFetchWithCredentials(url, {
      method: "POST",
      body: {
        parametre: transportData,
        type: "protocole_sanitaire"
      }
    });
    if (data.value) {
      const operateurId = data.value.operateurId;
      const url = `/operateur/recapitulatif/${operateurId}`;

      toaster.success("Fiche opérateur sauvegardée");
      navigateTo(url);
    }
    if (error.value) {
      log.w(error.value);
      toaster.error(`une erreur est survenue : ${error.value}`);
    }
  } catch (error) {
    log.w("Modification d'operateur - erreur", { error });
  }
}

onMounted(async () => {
  layoutStore.stepperIndex = 4;
  await operateurStore.setMyOperateur();
});
</script>

<style lang="scss" scoped></style>
