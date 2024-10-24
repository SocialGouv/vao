<template>
  <div v-if="!!demandeStore.currentDemande" class="fr-container header">
    <DemandesSejourDetails />
    <div class="fr-col-12 fr-mb-3w badge">
      <DsfrAlert
        v-if="isOrganismeNonAgree"
        role="alert"
        title="Organisme non agréé"
        :description="isOrganismeNonAgree"
        type="error"
      >
      </DsfrAlert>
    </div>
    <DsfrTabs
      v-model="selectedTabIndex"
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @update:model-value="selectTab"
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
        <DsfrAlert v-else-if="error" type="error" role="error"
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
        <Chat
          ref="chatRef"
          :messages="demandeStore.messages"
          :cdn-url="`${config.public.backendUrl}/documents/`"
          :is-loading="isSendingMessage"
          @send="sendMessage"
        />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-4"
        tab-id="tab-4"
        :selected="selectedTabIndex === 4"
        :asc="asc"
      >
        <DemandesSejourEigs :eigs="eigs?.eigs ?? []" :fetch-eig="executeEig" />
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
        <div class="fr-fieldset">
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
        </div>
      </DsfrModal>
    </div>
    <IsDownloading
      :is-downloading="apiStatus.isDownloading"
      :message="apiStatus.message"
    />
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import { Chat, IsDownloading } from "@vao/shared";
import { useIsDownloading } from "~/composables/useIsDownloading";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const usersStore = useUserStore();

const log = logger("pages/sejours");

const toaster = useToaster();
const { apiStatus, resetApiStatut, setApiStatut } = useIsDownloading();
const route = useRoute();

const initialSelectedIndex = parseInt(route.query.defaultTabIndex);

const chatRef = ref(null);
const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const config = useRuntimeConfig();

const selectTab = async (idx) => {
  asc.value = selectedTabIndex.value < idx;
  if (idx === 2 && !historique.value) {
    execute();
  }
  if (idx === 3 && userStore.user.serviceCompetent === "DEP") {
    await demandeStore.readMessages(route.params.declarationId);
    demandeStore.fetchMessages(route.params.declarationId);
  }
  if (idx === 4) {
    executeEig();
  }
};

const demandeStore = useDemandeSejourStore();
const organismeStore = useOrganismeStore();
const userStore = useUserStore();

const {
  data: historique,
  error,
  execute,
} = useFetchBackend(`/sejour/admin/historique/${route.params.declarationId}`, {
  immediate: false,
  method: "GET",
  credentials: "include",
});
const { data: eigs, execute: executeEig } = useFetchBackend(
  `/eig/admin/ds/${route.params.declarationId}`,
  {
    immediate: false,
    method: "GET",
    credentials: "include",
  },
);

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
  if (!usersStore.user.serviceCompetent) {
    await usersStore.refreshProfile();
  }
  try {
    await demandeStore.setCurrentDemande(route.params.declarationId);
    demandeStore.fetchMessages(route.params.declarationId);
    if (!usersStore.user.serviceCompetent) {
      await usersStore.refreshProfile();
    }
    if (
      parseInt(route.query.defaultTabIndex) === 3 &&
      userStore.user.serviceCompetent === "DEP"
    )
      await demandeStore.readMessages(route.params.declarationId);
  } catch (e) {
    log.w(e);
    navigateTo("/sejours");
  }
});

const isSendingMessage = ref(false);

const sendMessage = async ({ message, file }) => {
  let newFile;
  isSendingMessage.value = true;
  if (file) {
    try {
      const uuid = await UploadFile("message", file);
      newFile = {
        uuid,
        name: file.name ?? "document_messagerie",
        createdAt: new Date(),
      };
      toaster.info(`Document déposé`);
    } catch (error) {
      log.w(error);
      return toaster.error({
        titleTag: "h2",
        description: `Une erreur est survenue lors du dépôt du document ${file.name}`,
      });
    }
  }
  try {
    const url = `/message/admin/${route.params.declarationId}`;
    const response = await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: { message: message ?? "", file: newFile },
    });
    if (response.id) {
      chatRef.value.resetForm();
    }
    isSendingMessage.value = false;
  } catch (error) {
    isSendingMessage.value = false;
    log.w("envoi de message : ", { error });
    return toaster.error({
      titleTag: "h2",
      description: `Une erreur est survenue lors de l'envoi de votre message`,
    });
  }
  demandeStore.fetchMessages(route.params.declarationId);
};

const unreadMessages = computed(() => {
  const nb = demandeStore.messages.filter(
    (m) => !m.readAt && m.frontUserId != null,
  ).length;
  return nb && nb > 0 ? `(${nb})` : "";
});

const tabTitles = computed(() => [
  {
    title: "Formulaire",
    tabId: "tab-0",
    panelId: "tab-content-0",
  },
  {
    title: "Documents joints",
    tabId: "tab-1",
    panelId: "tab-content-1",
  },
  {
    title: "Historique de la déclaration",
    tabId: "tab-2",
    panelId: "tab-content-2",
  },
  {
    title: `Messagerie ${unreadMessages.value}`,
    tabId: "tab-3",
    panelId: "tab-content-3",
    icon: `${unreadMessages.value ? "ri:feedback-line" : ""}`,
  },
  // TODO(eig): unhide when ok
  /*
    {
      title: "EIG",
      tabId: "tab-4",
      panelId: "tab-content-4",
    },
  */
]);

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
  setApiStatut("Demande de complément en cours");
  onCloseModalDemandeComplements();

  try {
    await $fetchBackend(
      `/sejour/admin/${route.params.declarationId}/demande-complements`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(commentaires),
      },
    );
    await demandeStore.setCurrentDemande(route.params.declarationId);
    execute();
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
    });
  } finally {
    resetApiStatut();
  }
};

const onValidRefus = async (commentaires) => {
  setApiStatut("Prise en charge du refus en cours");
  onCloseModalDemandeComplements();

  try {
    await $fetchBackend(`/sejour/admin/${route.params.declarationId}/refus`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(commentaires),
    });
    await demandeStore.setCurrentDemande(route.params.declarationId);
    execute();
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
    });
  } finally {
    resetApiStatut();
  }
};

const onValidEnregistrement2Mois = async () => {
  setApiStatut("Enregistrement  de la demande en cours");

  onCloseModalEnregistrement2Mois();
  try {
    await $fetchBackend(
      `/sejour/admin/${route.params.declarationId}/enregistrement-2-mois`,
      {
        method: "POST",
        credentials: "include",
      },
    );
    await demandeStore.setCurrentDemande(route.params.declarationId);
    execute();
  } catch (error) {
    log.w("prend en charge", error);
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
    });
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
