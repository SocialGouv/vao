<template>
  <div class="fr-container">
    <div class="fr-grid-row fr-px-3w">
      <div class="fr-col-3">
        <OperateurMenuOperateur
          :active-id="hash"
          :operateur="operateurStore.operateurCourant ?? {}"
        ></OperateurMenuOperateur>
      </div>

      <div class="fr-col-9 fr-py-3w">
        <DsfrBreadcrumb :links="links" />
        <OperateurStepper :step="hash"></OperateurStepper>
        <div>
          <div id="info-generales">
            <OperateurInformationsGenerales
              v-if="hash === 'info-generales'"
              :init-data="operateurStore.operateurCourant ?? {}"
              @update="updateOrCreate"
              @next="nextHash"
            />
          </div>
          <div v-if="isSiege" id="agrement">
            <OperateurAgrement
              v-if="hash === 'agrement'"
              :init-data="operateurStore.operateurCourant ?? {}"
              @previous="previousHash"
              @next="nextHash"
            ></OperateurAgrement>
          </div>
          <div v-if="isSiege" id="protocole-transport">
            <protocole-transport
              v-if="hash === 'protocole-transport'"
              :init-data="
                operateurStore.operateurCourant.protocoleTransport ?? {}
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
                operateurStore.operateurCourant.protocoleSanitaire ?? {}
              "
              @update="updateOrCreate"
              @previous="previousHash"
              @next="nextHash"
            ></protocole-sanitaire>
          </div>
          <div id="synthese">
            <OperateurSynthese
              v-if="hash === 'synthese'"
              :init-data="operateurStore.operateurCourant ?? {}"
              @finalize="finalizeOperateur"
              @previous="previousHash"
            ></OperateurSynthese>
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
const log = logger("pages/operateur/[[idOperateur]]");

definePageMeta({
  middleware: ["is-connected", "check-id-operateur-param"],
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

const operateurStore = useOperateurStore();

const isSiege = computed(() => {
  return (
    !operateurStore.operateurCourant ||
    operateurStore.operateurCourant.typeOperateur === "personne_physique" ||
    operateurStore.operateurCourant.personneMorale?.siegeSocial === true
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

const idOrganisme = ref(route.params.idOperateur);

function previousHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  log.d({ hash: hash.value, index, next: sommaireOptions.value[index - 1] });
  return navigateTo({ hash: "#" + sommaireOptions.value[index - 1] });
}

function nextHash() {
  const index = sommaireOptions.value.findIndex((o) => o === hash.value);
  log.d({ hash, index, next: sommaireOptions.value[index + 1] });
  return navigateTo({
    path: `/operateur/${idOrganisme.value}`,
    hash: "#" + sommaireOptions.value[index + 1],
  });
}

async function updateOrCreate(operatorData, type) {
  log.i("updateOrCreate - IN", { operatorData, type });
  try {
    const url = idOrganisme.value
      ? `/operateur/${idOrganisme.value}`
      : "/operateur";
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...operatorData },
        type,
      },
    });

    toaster.success(
      `Fiche organisme ${idOrganisme.value ? "sauvegardée" : "créée"}`,
    );
    idOrganisme.value = data.operateurId;
    log.d(`operateur ${idOrganisme.value} mis à jour`);

    return nextHash();
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

async function finalizeOperateur() {
  log.i("finalizeOperateur - IN");
  try {
    const url = `/operateur/${operateurStore.operateurCourant.operateurId}`;
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: {},
        type: "synthese",
      },
    });
    const operateurId = data.operateurId;
    log.d(`operateur ${operateurId} finalisé`);
    toaster.success("Fiche organisme finalisée");
    return navigateTo("/");
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}
</script>

<style lang="scss" scoped></style>
