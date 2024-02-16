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
  layout: "operateur",
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
    const { operateurId } = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: transportData,
        type: "protocole_sanitaire",
      },
    });
    if (operateurId) {
      const url = `/operateur/recapitulatif/${operateurId}`;

      toaster.success("Fiche opérateur sauvegardée");
      navigateTo(url);
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
