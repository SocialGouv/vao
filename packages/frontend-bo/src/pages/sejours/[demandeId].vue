<template>
  <div v-if="!!demandeStore.currentDemande" class="fr-container header">
    <DemandesSejourDetails />
    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <DemandesSejourDisplayFormulaire />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <DemandesSejourDocuments :declaration="demandeStore.currentDemande" />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <DemandesSejourHistorique
          v-if="historique"
          :historique="historique.historique ?? []"
        />
        <DsfrAlert v-else-if="error" type="error"
          >Une erreur est survenue durant la récupération de l'historique de la
          déclaration
        </DsfrAlert>
      </DsfrTabContent>
    </DsfrTabs>
    <div
      v-if="
        userStore.user?.roles &&
        userStore.user?.roles.includes('DemandeSejour_Ecriture') &&
        demandeStore.currentDemande.estInstructeurPrincipal &&
        demandeStore.currentDemande.statut === demandesSejours.statuts.EN_COURS
      "
      class="container"
    >
      <DsfrButton
        ref="modalOrigin"
        label="Demander des compléments à l'organisateur"
        tertiary
        @click.prevent="onOpenModalDemandeComplements"
      />
      <DsfrModal
        ref="modal"
        name="modalComplement"
        :opened="modalComplement.opened"
        title="Demande de compléments"
        size="xl"
        @close="onCloseModalDemandeComplements"
      >
        <DemandesSejourCommentaire @valid="onValidComplement" />
      </DsfrModal>
      <DsfrButton
        ref="modalOrigin"
        label="Refuser"
        secondary
        @click.prevent="onOpenModalRefus"
      />
      <DsfrModal
        ref="modal"
        name="modalRefus"
        :opened="modalRefus.opened"
        title="Refus de la déclaration"
        size="xl"
        @close="onCloseModalRefus"
      >
        <DemandesSejourCommentaire @valid="onValidRefus" />
      </DsfrModal>
      <DsfrButton
        ref="modalOrigin"
        label="Accepter"
        @click.prevent="onOpenModalEnregistrement2Mois"
      />
      <DsfrModal
        ref="modal"
        name="modalEnregistrement2MOis"
        :opened="modalEnregistrement2Mois.opened"
        title="Enregistrement de la déclaration à 2 mois"
        @close="onCloseModalEnregistrement2Mois"
      >
        <article class="fr-mb-4v">
          Vous vous apprêtez à enregistrer la déclaration de séjour par l’envoi
          d’un accusé réception : <br />
          - {{ demandeStore.currentDemande.libelle }}
        </article>
        <fieldset class="fr-fieldset">
          <div class="fr-col-4">
            <div class="fr-input-group">
              <DsfrButton
                id="previous-step"
                :secondary="true"
                @click.prevent="onCloseModalEnregistrement2Mois"
                >Retour
              </DsfrButton>
            </div>
          </div>
          <div class="fr-col-8">
            <div class="fr-input-group">
              <DsfrButton
                id="next-step"
                @click.prevent="onValidEnregistrement2Mois"
                >Enregistrer la déclaration
              </DsfrButton>
            </div>
          </div>
        </fieldset>
      </DsfrModal>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

import { DsfrTabContent, DsfrTabs } from "@gouvminint/vue-dsfr";

const log = logger("pages/sejours");

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;

const route = useRoute();

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
  if (idx === 2 && !historique.value) {
    execute();
  }
};

const demandeStore = useDemandeSejourStore();
const userStore = useUserStore();

const {
  data: historique,
  error,
  execute,
} = useFetchBackend(`/sejour/admin/historique/${route.params.demandeId}`, {
  immediate: false,
  method: "GET",
  credentials: "include",
});

onMounted(async () => {
  try {
    await demandeStore.setCurrentDemande(route.params.demandeId);
  } catch (e) {
    navigateTo("/sejours");
  }
});

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "Historique de la déclaration" },
];

const modalComplement = reactive({
  opened: false,
});

const modalRefus = reactive({
  opened: false,
});

const modalEnregistrement2Mois = reactive({
  opened: false,
});

const onOpenModalDemandeComplements = () => {
  modalComplement.opened = true;
};

const onCloseModalDemandeComplements = () => {
  modalComplement.opened = false;
};

const onOpenModalRefus = () => {
  modalRefus.opened = true;
};

const onCloseModalRefus = () => {
  modalRefus.opened = false;
};

const onOpenModalEnregistrement2Mois = () => {
  modalEnregistrement2Mois.opened = true;
};

const onCloseModalEnregistrement2Mois = () => {
  modalEnregistrement2Mois.opened = false;
};

const onValidComplement = async (commentaires) => {
  onCloseModalDemandeComplements();

  try {
    await $fetchBackend(
      `/sejour/admin/${route.params.demandeId}/demande-complements`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(commentaires),
      },
    );
    await demandeStore.setCurrentDemande(route.params.demandeId);
    execute();
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error("Erreur lors de la prise en charge de la demande");
  }
};

const onValidRefus = async (commentaires) => {
  onCloseModalDemandeComplements();

  try {
    await $fetchBackend(`/sejour/admin/${route.params.demandeId}/refus`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(commentaires),
    });
    await demandeStore.setCurrentDemande(route.params.demandeId);
    execute();
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error("Erreur lors de la prise en charge de la demande");
  }
};

const onValidEnregistrement2Mois = async () => {
  onCloseModalEnregistrement2Mois();
  try {
    await $fetchBackend(
      `/sejour/admin/${route.params.demandeId}/enregistrement-2-mois`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    await demandeStore.setCurrentDemande(route.params.demandeId);
    execute();
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error("Erreur lors de la prise en charge de la demande");
  }
};
</script>

<style scoped>
.header {
  padding: 1em 0em;
}

.container {
  display: flex;
  margin-top: 1rem;
  margin-bottom: 1rem;
  justify-content: right;
  gap: 1rem;
}
</style>
