<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-px-3w">
      <div class="fr-col-3">
        <OrganismeMenuOrganisme
          :active-id="hash"
          :organisme="organismeStore.organismeCourant ?? {}"
        ></OrganismeMenuOrganisme>
      </div>

      <div class="fr-col-9 fr-py-3w">
        <DsfrBreadcrumb :links="links" />
        <OrganismeStepper :step="hash"></OrganismeStepper>
        <div>
          <div id="info-generales">
            <OrganismeInformationsGenerales
              v-if="hash === 'info-generales'"
              :init-data="organismeStore.organismeCourant ?? {}"
              @update="updateOrCreate"
              @next="nextHash"
            />
          </div>
          <div v-if="isSiege" id="agrement">
            <OrganismeAgrement
              v-if="hash === 'agrement'"
              :init-data="organismeStore.organismeCourant ?? {}"
              @previous="previousHash"
              @next="nextHash"
            ></OrganismeAgrement>
          </div>
          <div v-if="isSiege" id="protocole-transport">
            <protocole-transport
              v-if="hash === 'protocole-transport'"
              :init-data="
                organismeStore.organismeCourant.protocoleTransport ?? {}
              "
              @update="updateOrCreate"
              @previous="previousHash"
              @next="nextHash"
            ></protocole-transport>
          </div>
          <div v-if="isSiege" id="protocole-sanitaire">
            <protocole-sanitaire
              v-if="hash === 'protocole-sanitaire'"
              :init-data="
                organismeStore.organismeCourant.protocoleSanitaire ?? {}
              "
              @update="updateOrCreate"
              @previous="previousHash"
              @next="nextHash"
            ></protocole-sanitaire>
          </div>
          <div id="synthese">
            <OrganismeSynthese
              v-if="hash === 'synthese'"
              :init-data="organismeStore.organismeCourant ?? {}"
              @finalize="finalizeOrganisme"
              @previous="previousHash"
            ></OrganismeSynthese>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/organisme/[[idOrganisme]]");

definePageMeta({
  middleware: ["is-connected", "check-id-organisme-param"],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Ma fiche organisateur",
  },
];

const organismeStore = useOrganismeStore();

const isSiege = computed(() => {
  return (
    !organismeStore.organismeCourant ||
    organismeStore.organismeCourant.typeOrganisme === "personne_physique" ||
    organismeStore.organismeCourant.personneMorale?.siegeSocial === true
  );
});
const sommaireOptions = computed(() =>
  organismeMenus
    .filter((m) => isSiege.value || m.displayForEtabSecondaire)
    .map((m) => m.id),
);

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return sommaireOptions.value[0];
});

const idOrganisme = ref(route.params.idOrganisme);

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  log.d({ hash: hash.value, index, next: sommaireOptions.value[index - 1] });
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  log.d({ hash, index, next: sommaireOptions.value[index + 1] });
  return navigateTo({
    path: `/organisme/${idOrganisme.value}`,
    hash: "#" + sommaireOptions.value[index + 1],
  });
}

async function updateOrCreate(organismeData, type) {
  log.i("updateOrCreate - IN", { organismeData, type });
  try {
    const url = idOrganisme.value
      ? `/organisme/${idOrganisme.value}`
      : "/organisme";
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...organismeData },
        type,
      },
    });

    toaster.success(
      `Fiche organisme ${idOrganisme.value ? "sauvegardée" : "créée"}`,
    );
    idOrganisme.value = data.organismeId;
    log.d(`organisme ${idOrganisme.value} mis à jour`);

    return nextHash();
  } catch (error) {
    log.w("Creation/modification d'organisme : ", { error });
  }
}

async function finalizeOrganisme() {
  log.i("finalizeOrganisme - IN");
  try {
    const url = `/organisme/${organismeStore.organismeCourant.organismeId}`;
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: {},
        type: "synthese",
      },
    });
    const organismeId = data.organismeId;
    log.d(`organisme ${organismeId} finalisé`);
    toaster.success("Fiche organisme finalisée");
    return navigateTo("/");
  } catch (error) {
    log.w("Creation/modification d'organisme : ", { error });
  }
}
</script>

<style lang="scss" scoped></style>
