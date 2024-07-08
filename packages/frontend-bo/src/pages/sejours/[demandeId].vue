<template>
  <div v-if="!!demandeStore.currentDemande" class="fr-container header">
    <DemandesSejourDetails />
    <div class="fr-col-12 fr-mb-3w badge">
      <DsfrAlert
        v-if="isOrganismeNonAgree"
        title="Organisme non agréé"
        :description="isOrganismeNonAgree"
        type="error"
      >
      </DsfrAlert>
    </div>
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
        <DemandesSejourDocuments
          :declaration="demandeStore.currentDemande"
          :messages="demandeStore.messages ?? []"
        />
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
      <DsfrTabContent
        panel-id="tab-content-3"
        tab-id="tab-3"
        :selected="selectedTabIndex === 3"
        :asc="asc"
      >
        <DemandesSejourMessage
          :messages="demandeStore.messages"
          @send="fetchMessages"
        />
      </DsfrTabContent>
    </DsfrTabs>
    <div
      v-if="
        !apiStatus.isDownloading &&
        userStore.user?.roles &&
        userStore.user?.roles.includes('DemandeSejour_Ecriture') &&
        demandeStore.currentDemande.estInstructeurPrincipal &&
        (demandeStore.currentDemande.statut ===
          demandesSejours.statuts.EN_COURS ||
          demandeStore.currentDemande.statut ===
            demandesSejours.statuts.EN_COURS_8J)
      "
      class="container"
    >
      <DsfrButton
        ref="modalOrigin"
        label="Demander des compléments à l'organisateur"
        tertiary
        :disabled="apiStatus.isDownloading"
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
        :disabled="apiStatus.isDownloading"
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
        :disabled="apiStatus.isDownloading"
        @click.prevent="onOpenModalEnregistrement2Mois"
      />
      <DsfrModal
        ref="modal"
        name="modalEnregistrement2MOis"
        :opened="modalEnregistrement2Mois.opened"
        :title="
          demandeStore.currentDemande.statut ===
          demandesSejours.statuts.EN_COURS
            ? 'Enregistrement de la déclaration à 2 mois'
            : 'Enregistrement de la déclaration à 8 jours'
        "
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
    <UtilsIsDownloading
      :is-downloading="apiStatus.isDownloading"
      :message="apiStatus.message"
    />
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { useIsDownloading } from "~/composables/useIsDownloading";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const log = logger("pages/sejours");

const toaster = useToaster();
const { apiStatus, resetApiStatut, setApiStatut } = useIsDownloading();
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
const organismeStore = useOrganismeStore();
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

organismeStore.fetchOrganismesNonAgrees({});

const isOrganismeNonAgree = computed(() => {
  const organisme = organismeStore.organismesNonAgrees.find(
    (o) =>
      o.siret === demandeStore.currentDemande.organisme?.personneMorale?.siret,
  );
  return organisme
    ? `L'organisme ${organisme.nom} n'est plus agréé depuis le ${dayjs(organisme.dateDecision).format("DD/MM/YYYY")} pour la raison suivante : ${organisme.natureDecision}`
    : "";
});

onMounted(async () => {
  try {
    await demandeStore.setCurrentDemande(route.params.demandeId);
    fetchMessages();
  } catch (e) {
    navigateTo("/sejours");
  }
});

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "Historique de la déclaration" },
  { title: "Messages" },
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

const fetchMessages = () => {
  demandeStore.fetchMessages(route.params.demandeId);
};
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
  setApiStatut("Demande de complément en cours");
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
  } finally {
    resetApiStatut();
  }
};

const onValidRefus = async (commentaires) => {
  setApiStatut("Prise en charge du refus en cours");
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
  } finally {
    resetApiStatut();
  }
};

const onValidEnregistrement2Mois = async () => {
  setApiStatut("Enregistrement  de la demande en cours");

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
  } finally {
    resetApiStatut();
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
  align-items: center;
  gap: 1rem;
}
</style>
