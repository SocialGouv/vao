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
            @update="updateOrCreate"
            @next="nextHash"
          />
        </div>
        <div id="info-vacanciers">
          <DSInformationsVacanciers
            v-if="hash === 'info-vacanciers'"
            :init-data="demandeCourante.informationsVacanciers ?? {}"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
        </div>
        <div id="info-transport">
          <protocole-transport
            v-if="hash === 'info-transport'"
            :init-data="demandeCourante.informationsTransport ?? {}"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          ></protocole-transport>
        </div>
        <div id="info-sanitaires">
          <protocole-sanitaire
            v-if="hash === 'info-sanitaires'"
            :init-data="demandeCourante.informationsSanitaires ?? {}"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          ></protocole-sanitaire>
        </div>
        <div id="info-personnel">
          <DSInformationsPersonnel
            v-if="hash === 'info-personnel'"
            :init-data="demandeCourante.informationsPersonnel ?? {}"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
        </div>
        <div id="projet-sejour">
          <DSProjetSejour
            v-if="hash === 'projet-sejour'"
            :init-data="demandeCourante.informationsProjetSejour ?? {}"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
        </div>
        <div id="hebergements">
          <DSHebergementsSejour
            v-if="hash === 'hebergements'"
            :date-debut="demandeCourante.dateDebut"
            :date-fin="demandeCourante.dateFin"
            :hebergement="demandeCourante.hebergement ?? {}"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
        </div>
        <div id="synthese"></div>
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

const sejourId = ref(route.params.idDemande);

async function updateOrCreate(sejourData, updatetype) {
  log.i("updateOrCreate - IN", { sejourData, updatetype });
  try {
    const url = sejourId.value ? `/sejour/${sejourId.value}` : "/sejour";
    log.d(url);
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...sejourData },
        type: updatetype,
      },
    });

    toaster.success(
      `Demande de séjour ${sejourId.value ? "sauvegardée" : "créée"}`,
    );
    log.d(`demande de séjour ${sejourId.value} mis à jour`);
    sejourId.value = data.id;
    return nextHash();
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.findIndex((o) => o === hash.value);
  return navigateTo({
    path: `/demande-sejour/${sejourId.value}`,
    hash: "#" + sommaireOptions[index + 1],
  });
}
</script>

<style lang="scss" scoped></style>
