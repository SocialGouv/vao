<template>
  <div class="fr-grid-row fr-px-3w">
    <div class="fr-col-3">
      <OperateurMenuOperateur
        :active-id="hash"
        :operateur="operateurStore.operateurCourant"
      ></OperateurMenuOperateur>
    </div>

    <div class="fr-col-9 fr-py-3w">
      <OperateurStepper :step="hash"></OperateurStepper>
      <div>
        <div id="info-generales">
          <OperateurInformationsGenerales
            v-if="hash === 'info-generales'"
            :init-data="operateurCourant"
            @valid="updateOrCreate"
          />
        </div>
        <div id="agrement">
          <OperateurAgrement
            v-if="hash === 'agrement'"
            :init-data="operateurCourant"
            @valid="nextHash(hash)"
          ></OperateurAgrement>
        </div>
        <div id="protocole-transport">
          <protocole-transport
            v-if="hash === 'protocole-transport'"
            :init-data="operateurCourant.protocoleTransport ?? {}"
            @valid="updateOrCreate"
          ></protocole-transport>
        </div>
        <div id="protocole-sanitaire">
          <protocole-sanitaire
            v-if="hash === 'protocole-sanitaire'"
            :init-data="operateurCourant.protocoleSanitaire ?? {}"
            @valid="updateOrCreate"
          ></protocole-sanitaire>
        </div>
        <div id="synthese">
          <OperateurSynthese
            v-if="hash === 'synthese'"
            :init-data="operateurCourant"
            @valid="finalizeOperateur"
          ></OperateurSynthese>
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
  middleware: ["is-connected", "has-id-operateur"],
  layout: "operateur",
});

const operateurStore = useOperateurStore();

const operateurCourant = computed(() => {
  return operateurStore.operateurCourant;
});

const sommaireOptions = organismeMenus.map((m) => m.id);

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return sommaireOptions[0];
});

function previousHash(hash) {
  const index = sommaireOptions.findIndex((o) => o === hash);
  return navigateTo({ hash: "#" + sommaireOptions[index - 1] });
}

function nextHash(hash) {
  const index = sommaireOptions.findIndex((o) => o === hash);
  log.d({ hash, index, next: sommaireOptions[index + 1] });
  return navigateTo({ hash: "#" + sommaireOptions[index + 1] });
}

async function updateOrCreate(operatorData, updatetype) {
  log.i("updateOrCreate - IN", { operatorData, updatetype });
  try {
    const url = route.params.idOperateur
      ? `/operateur/${route.params.idOperateur}`
      : "/operateur";
    const data = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: {
        parametre: { ...operatorData },
        type: updatetype,
      },
    });

    const operateurId = data.operateurId;
    log.d(`operateur ${operateurId} mis à jour`);
    toaster.success(
      `Fiche organisme ${route.params.idOperateur ? "sauvegardée" : "créée"}`,
    );
    return nextHash(hash.value);
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}

async function finalizeOperateur() {
  log.i("finalizeOperateur - IN");
  try {
    const url = `/operateur/${operateurCourant.value.operateurId}`;
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
    await operateurStore.setMyOperateur();
    toaster.success("Fiche organisme finalisée");
    return navigateTo("/");
  } catch (error) {
    log.w("Creation/modification d'operateur : ", { error });
  }
}
</script>

<style lang="scss" scoped></style>
