<template>
  <div>
    <DsfrBreadcrumb :links="links" />
    <DSStepper :step="8"></DSStepper>
    <div class="fr-container">
      <div class="fr-grid-row">
        <hebergement></hebergement>
        <div class="fr-container">
          <fieldset class="fr-fieldset">
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrButton id="retour" :secondary="true" @click="back"
                  >Retour</DsfrButton
                >
              </div>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrButton id="precedent" :secondary="true" @click="previous"
                  >Précédent</DsfrButton
                >
              </div>
            </div>
            <div class="fr-col-4">
              <div class="fr-input-group">
                <DsfrButton id="Suivant" @click="next">Suivant</DsfrButton>
              </div>
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDemandeSejourStore } from "@/stores/demande-sejour";
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected"],
});

const log = logger("demande-sejour/informations-generales");
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/demande-sejour/liste",
    text: "Demande de séjour",
  },
  {
    text: "hebergement",
  },
];

const demandeSejourStore = useDemandeSejourStore();

// const demandeCourante = computed(() => {
//   return demandeSejourStore.demandeCourante;
// });

function back() {
  log.d("back - IN");
  navigateTo("/demande-sejour/liste");
}
async function next() {
  log.d("next - IN");
  try {
    const url = `/front-server/sejour/${route.params.idDemande}`;
    await useFetch(url, {
      method: "POST",
      body: {
        parametre: { informationsPersonnel: { ...values } },
        type: "informationsPersonnel",
      },
      async onResponse({ response }) {
        if (!response.ok) {
          toaster.error(
            response._data.message ?? "Erreur lors de la sauvegarde"
          );
        } else {
          log.d("demande de sejour mise à jour");
          toaster.success("informations sur le personnel sauvegardées");
          await navigateTo(
            `/demande-sejour/projet-sejour/${route.params.idDemande}`
          );
        }
      },
    });
  } catch (error) {
    log.w("submitCompte - erreur", { error });
  }
}

function previous() {
  log.d("previous - IN");
  navigateTo(
    `/demande-sejour/informations-sanitaires/${route.params.idDemande}`
  );
}

onMounted(async () => {
  await demandeSejourStore.setDemandeCourante(route.params.idDemande);
});
</script>

<style lang="scss" scoped>
#bloc-connexion {
  color: #000091;
  border-radius: 10px;
  border: solid;
}
</style>
