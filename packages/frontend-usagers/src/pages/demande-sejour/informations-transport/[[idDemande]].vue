<template>
  <div>
    <protocole-transport
      :init-data="demandeCourante.informationsTransport ?? {}"
      @valid="next"
    ></protocole-transport>
  </div>
</template>

<script setup>
import { useDemandeSejourStore } from "@/stores/demande-sejour";
import { useLayoutStore } from "@/stores/layout";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected", "has-id-demande-sejour"],
  layout: "demande-sejour",
});

const log = logger("demande-sejour/informations-generales");

const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

async function next(informationsTransportData) {
  log.d("next - IN");
  try {
    const url = `/sejour/${route.params.idDemande}`;
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: {
          informationsTransport: informationsTransportData,
        },
        type: "informationsTransport",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde",
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success(
            "informations sur le transport des vacanciers sauvegardées",
          );
          await navigateTo(
            `/demande-sejour/informations-sanitaires/${route.params.idDemande}`,
          );
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(() => {
  layoutStore.breadCrumb = "informations sur le transport";
  layoutStore.stepperIndex = 6;
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
