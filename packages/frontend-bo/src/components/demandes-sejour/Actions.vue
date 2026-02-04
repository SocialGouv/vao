<template>
  <div v-if="isActionsVisible">
    <DsfrButton
      label="Demander des compléments à l'organisateur"
      tertiary
      type="button"
      :disabled="apiStatus.isDownloading"
      @click="isModalComplementOpened = true"
    />
    <DsfrModal
      name="modalComplement"
      :opened="isModalComplementOpened"
      title="Demande de compléments"
      size="xl"
      @close="isModalComplementOpened = false"
    >
      <DemandesSejourCommentaire @valid="onValidComplement" />
    </DsfrModal>
    <DsfrButton
      label="Refuser"
      secondary
      type="button"
      :disabled="apiStatus.isDownloading"
      @click="isModalRefusOpened = true"
    />
    <DsfrModal
      name="modalRefus"
      :opened="isModalRefusOpened"
      title="Refus de la déclaration"
      size="xl"
      @close="isModalRefusOpened = false"
    >
      <DemandesSejourCommentaire @valid="onValidRefus" />
    </DsfrModal>
    <DsfrButton
      label="Accepter"
      type="button"
      :disabled="apiStatus.isDownloading"
      @click="isModalEnregistrement2MoisOpened = true"
    />
    <DsfrModal
      name="modalEnregistrement2MOis"
      :opened="isModalEnregistrement2MoisOpened"
      :title="
        currentDemande.statut === status.EN_COURS
          ? 'Enregistrement de la déclaration à 2 mois'
          : 'Enregistrement de la déclaration à 8 jours'
      "
      @close="isModalEnregistrement2MoisOpened = false"
    >
      <article class="fr-mb-4v">
        Vous vous apprêtez à enregistrer la déclaration de séjour par l’envoi
        d’un accusé réception : <br />
        - {{ currentDemande.libelle }}
      </article>
      <div class="fr-fieldset">
        <div class="fr-col-4">
          <div class="fr-input-group">
            <DsfrButton
              id="previous-step"
              :secondary="true"
              type="button"
              @click="onCloseModalEnregistrement2Mois"
            >
              Retour
            </DsfrButton>
          </div>
        </div>
        <div class="fr-col-8">
          <div class="fr-input-group">
            <DsfrButton
              id="next-step"
              type="button"
              @click="onValidEnregistrement2Mois"
              >Enregistrer la déclaration
            </DsfrButton>
          </div>
        </div>
      </div>
    </DsfrModal>
    <IsDownloading
      :is-downloading="apiStatus.isDownloading"
      :message="apiStatus.message"
    />
  </div>
</template>

<script setup>
import { useIsDownloading } from "~/composables/useIsDownloading";
import { useToaster } from "@vao/shared-ui";

const demandeSejourStore = useDemandeSejourStore();
const userStore = useUserStore();
const toaster = useToaster();
const route = useRoute();

const currentDemande = computed(() => demandeSejourStore.currentDemande);
const status = demandesSejours.statuts;

const { apiStatus, resetApiStatut, setApiStatut } = useIsDownloading();

const isModalComplementOpened = ref(false);
const isModalRefusOpened = ref(false);
const isModalEnregistrement2MoisOpened = ref(false);

const onValidComplement = async (commentaires) => {
  setApiStatut("Demande de complément en cours");
  isModalComplementOpened.value = false;

  try {
    await demandeSejourStore.setAdditionalRequest(
      route.params.declarationId,
      commentaires,
    );
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
      role: "alert",
    });
    throw error;
  } finally {
    resetApiStatut();
  }
  try {
    await Promise.all([
      demandeSejourStore.getCurrentDemande(route.params.declarationId),
      demandeSejourStore.getHistory(route.params.declarationId),
    ]);
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de récupération des infos mise à jours",
      role: "alert",
    });
    throw error;
  }
};

const onValidRefus = async (commentaires) => {
  setApiStatut("Prise en charge du refus en cours");
  isModalRefusOpened.value = false;

  try {
    await demandeSejourStore.setDenial(
      route.params.declarationId,
      commentaires,
    );
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
      role: "alert",
    });
    throw error;
  } finally {
    resetApiStatut();
  }
  try {
    await Promise.all([
      demandeSejourStore.getCurrentDemande(route.params.declarationId),
      demandeSejourStore.getHistory(route.params.declarationId),
    ]);
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de récupération des infos mise à jours",
      role: "alert",
    });
    throw error;
  }
};

const onValidEnregistrement2Mois = async () => {
  setApiStatut("Enregistrement  de la demande en cours");
  isModalEnregistrement2MoisOpened.value = false;

  try {
    await demandeSejourStore.setRegistration2Months(route.params.declarationId);
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de la prise en charge de la demande",
      role: "alert",
    });
    throw error;
  } finally {
    resetApiStatut();
  }
  try {
    await Promise.all([
      demandeSejourStore.getHistory(route.params.declarationId),
      demandeSejourStore.getCurrentDemande(route.params.declarationId),
    ]);
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description: "Erreur lors de récupération des infos mise à jours",
      role: "alert",
    });
    throw error;
  }
};

const isActionsVisible = computed(
  () =>
    !apiStatus.isDownloading &&
    userStore.user?.roles?.includes("DemandeSejour_Ecriture") &&
    demandeSejourStore.currentDemande.estInstructeurPrincipal &&
    (demandeSejourStore.currentDemande.statut === status.EN_COURS ||
      demandeSejourStore.currentDemande?.statut === status.EN_COURS_8J),
);
</script>
