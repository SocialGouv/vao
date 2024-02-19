<template>
  <div>
    <protocole-sanitaire
      :init-data="demandeCourante?.informationsSanitaires ?? {}"
      @valid="next"
    ></protocole-sanitaire>
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

const log = logger("demande-sejour/informations-sanitaires");

const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  log.i(demandeSejourStore.demandeCourante);
  return demandeSejourStore.demandeCourante;
});

async function next(informationsSanitairesData) {
  log.d("next - IN");
  try {
    const url = `/sejour/${route.params.idDemande}`;
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: {
          informationsSanitaires: informationsSanitairesData,
        },
        type: "informationsSanitaires",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde",
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("informations sanitaires sauvegardées");
          await navigateTo(
            `/demande-sejour/hebergement/${route.params.idDemande}`,
          );
        }
      },
    });
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(() => {
  log.i("mounted", route.params.idDemande);
  layoutStore.breadCrumb = "informations sanitaires";
  layoutStore.stepperIndex = 7;
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
