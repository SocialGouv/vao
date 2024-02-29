<template>
  <div class="fr-grid-row fr-px-3w">
    <div class="fr-col-3">
      <DSMenuDemandeSejour
        :active-id="hash"
        :demande="demandeCourante"
      ></DSMenuDemandeSejour>
    </div>

    <div class="fr-col-9 fr-py-3w">
      <DSStepper :step="hash"></DSStepper>
      <div>
        <div id="info-generales">
          <DSInformationsGenerales
            v-if="hash === 'info-generales'"
            :init-data="demandeCourante ?? {}"
            @valid="updateOrCreate"
          />
        </div>
        <div id="info-vacanciers">
          <DSInformationsVacanciers
            v-if="hash === 'info-vacanciers'"
            :init-data="demandeCourante.informationsVacanciers ?? {}"
            @valid="updateOrCreate"
          />
        </div>
        <div id="info-transport">
          <protocole-transport
            v-if="hash === 'info-transport'"
            :init-data="demandeCourante.informationsTransport ?? {}"
            @valid="updateOrCreate"
          ></protocole-transport>
        </div>
        <div id="info-sanitaires">
          <protocole-sanitaire
            v-if="hash === 'info-sanitaires'"
            :init-data="demandeCourante.informationsSanitaires ?? {}"
            @valid="updateOrCreate"
          ></protocole-sanitaire>
        </div>
        <div id="info-personnel">
          <DSInformationsPersonnel
            v-if="hash === 'info-personnel'"
            :init-data="demandeCourante.informationsPersonnel ?? {}"
            @valid="updateOrCreate"
          />
        </div>
        <div id="projet-sejour">
          <DSProjetSejour
            v-if="hash === 'projet-sejour'"
            :init-data="demandeCourante.informationsProjetSejour ?? {}"
            @valid="updateOrCreate"
          />
        </div>
        <div id="hebergements">
          <DSHebergementsSejour
            v-if="hash === 'hebergements'"
            :init-data="demandeCourante ?? {}"
            @valid="updateOrCreate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

definePageMeta({
  middleware: ["is-connected", "has-id-demande-sejour"],
  layout: "demande-sejour",
});

const log = logger("pages/demande-sejour/[[idDemande]]");

const demandeSejourStore = useDemandeSejourStore();
const demandeCourante = computed(() => {
  return demandeSejourStore.demandeCourante;
});

const sommaireOptions = demandeSejourMenus.map((m) => m.id);

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return sommaireOptions[0];
});

function nextHash(hash, sejourId) {
  const index = sommaireOptions.findIndex((o) => o === hash);
  log.d({ hash, index, next: sommaireOptions[index + 1] });
  return navigateTo({
    path: `/demande-sejour/${sejourId}`,
    hash: "#" + sommaireOptions[index + 1],
  });
}

async function updateOrCreate(sejourData, updatetype) {
  log.i("updateOrCreate - IN", { sejourData, updatetype });
  try {
    const url = route.params.idDemande
      ? `/sejour/${route.params.idDemande}`
      : "/sejour";
    log.d(url);
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...sejourData },
        type: updatetype,
      },
    });

    const sejourId = data.id;
    log.d(`demande de séjour ${sejourId} mis à jour`);
    toaster.success(
      `Demande de séjour ${route.params.idDemande ? "sauvegardée" : "créée"}`,
    );
    return nextHash(hash.value, sejourId);
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}
</script>

<style lang="scss" scoped></style>
