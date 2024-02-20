<template>
  <div>
    <Organisateur
      :init-data="demandeCourante.organisateurs ?? []"
      @valid="next"
    >
    </Organisateur>
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

const log = logger("demande-sejour/organisateurs");

const demandeSejourStore = useDemandeSejourStore();
const layoutStore = useLayoutStore();

const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const isUpdate = computed(() => {
  return !!route.params.idDemande;
});

async function next(organisateurs) {
  log.d("next - IN");
  try {
    if (isUpdate.value) {
      const url = `/sejour/${route.params.idDemande}`;
      await $fetchBackend(url, {
        method: "POST",
        credentials: "include",
        body: {
          parametre: { organisateurs },
          type: "organisateurs",
        },
      });
      log.d("demande de sejour mise à jour");
      toaster.success("Liste des organisateurs du séjour sauvegardée");
      await navigateTo(
        `/demande-sejour/informations-vacanciers/${route.params.idDemande}`,
      );
    }
  } catch (error) {
    log.w("next - erreur", { error });
  }
}

onMounted(() => {
  layoutStore.breadCrumb = "informations générales";
  layoutStore.stepperIndex = 2;
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
