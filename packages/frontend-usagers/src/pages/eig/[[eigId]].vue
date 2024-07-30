<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row fr-px-3w">
      <div class="fr-col-xs-12 fr-col-md-3">
        <EIGMenu :active-id="hash" :eig-id="eigId ? parseInt(eigId) : null" />
      </div>
      <div class="fr-col-xs-12 fr-col-md-9 fr-py-3w">
        <div class="fr-pb-6v">
          <EIGStepper :step="hash" />
          <EIGSelectionSejour
            v-if="hash === 'eig-selection-sejour' || !hash"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @update="updateOrCreate"
            @next="nextHash"
          />
          <EIGType
            v-if="hash === 'eig-type-evenement'"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
          <EIGRenseignementsGeneraux
            v-if="hash === 'eig-renseignements-generaux'"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @update="updateOrCreate"
            @next="nextHash"
            @previous="previousHash"
          />
          <EIGRecap
            v-if="hash === 'eig-recap'"
            :is-downloading="apiStatus.isDownloading"
            :message="apiStatus.message"
            @finalize="finalize"
            @previous="previousHash"
          />
        </div>
        <DsfrAlert>
          <p>
            L’article R. 412-14-1 du code du tourisme prévoit que les personnes
            responsables de l’organisation du séjour sur le lieu de vacances
            sont tenues d’informer sans délai le préfet du département du lieu
            de séjour de tout accident grave ainsi que de toute situation
            présentant ou ayant présenté des risques graves pour la santé,
            l’intégrité ou le bien être physique et moral des personnes
            handicapées majeures.
          </p>
        </DsfrAlert>
      </div>
    </div>
  </div>
</template>

<script setup>
import { eigModel } from "@vao/shared";

definePageMeta({
  middleware: ["is-connected", "check-eig-id-param"],
});

useHead({
  title: "eig détaillée | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description d'une eig.",
    },
  ],
});

const route = useRoute();
const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();
const toaster = useToaster();
const eigStore = useEigStore();

const log = logger("pages/eig/[[eigId]]");

const eigId = ref(route.params.eigId);

const hash = computed(() => route.hash.slice(1) || eigMenu[0].id);

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/eig/liste",
    text: "Liste des déclarations des eig",
  },
  {
    text: "Déclarer un événement indésirable et grave",
  },
];

const updateOrCreate = async (data, type) => {
  log.i("updateOrCreate - IN", { data, type });
  setApiStatut(
    `${eigId.value ? "Sauvegarde" : "Création"} de la demande de séjour en cours`,
  );
  try {
    let response;
    if (eigId.value) {
      response = await eigStore.updateEig(eigId.value, type, data);
    } else {
      response = await eigStore.create(data);
    }

    toaster.success(`EIG ${eigId.value ? "sauvegardée" : "créée"}`);
    log.d(`EIG ${eigId} mis à jour`);
    eigId.value = response.id;
    return await nextHash();
  } catch (error) {
    log.w("Creation/modification EIG: ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la mise à jour de l'EIG'`,
    );
  } finally {
    resetApiStatut();
    data;
  }
};

function previousHash() {
  const index = eigMenu.findIndex((o) => o.id === hash.value);
  return navigateTo({ hash: "#" + eigMenu[index - 1].id });
}

const nextHash = () => {
  const index = eigMenu.findIndex((o) => o.id === hash.value);
  return navigateTo({
    path: `/eig/${eigId.value}`,
    hash: "#" + eigMenu[index + 1].id,
  });
};

async function finalize(body) {
  log.i("finalize eig -IN");
  setApiStatut("Transmission de l'eig en cours");
  try {
    await eigStore.updateEig(
      eigId.value,
      eigModel.UpdateTypes.EMAIL_AUTRES_DESTINATAIRES,
      body,
    );
    await eigStore.depose(eigId.value, body);
    toaster.success(`L'EIG a été déposé`);
    log.d(`EIG ${eigId.value} deposé`);
    return await navigateTo("/eig/liste");
  } catch (error) {
    log.w("Finalisation de la declaration de sejour : ", { error });
    return toaster.error(
      `Une erreur est survenue lors de la transmission de la déclaration de séjour`,
    );
  } finally {
    resetApiStatut();
  }
}
</script>
