<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col">
        <div v-if="hebergementId" class="title">
          <h1>Hébergement {{ hebergementStore.hebergementCourant.nom }}</h1>
          <HebergementStatusBadge
            :statut="
              hebergementId
                ? hebergementStore.hebergementCourant.statut
                : hebergementUtils.statut.BROUILLON
            "
          />
        </div>
        <h1 v-else>Création d'un nouveau lieu d'hébergement</h1>
      </div>
    </div>
    <div class="fr-fieldset__element">
      <span class="fr-hint-text"
        >Sauf mention contraire “(optionnel)” dans le label, tous les champs
        sont obligatoires</span
      >
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <HebergementWithSave
          :init-hebergement="
            hebergementId ? hebergementStore.hebergementCourant : {}
          "
          :cdn-url="`${config.public.backendUrl}/documents/`"
          default-back-route="/hebergements"
          :is-downloading="apiStatus.isDownloading"
          :is-disabled="
            hebergementId
              ? (hebergementStore.hebergementCourant.statut ??
                  hebergementUtils.statut.BROUILLON) ===
                hebergementUtils.statut.DESACTIVE
              : false
          "
          :message="apiStatus.message"
          mode-brouillon-activated
          is-save-visible
          @submit="updateOrCreate"
          @submit-brouillon="updateOrCreateBrouillon"
          @activate="activate"
          @desactivate="desactivate"
          @reactivate="reactivate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { eigUtils, fileUtils } from "@vao/shared-ui";
import HebergementStatusBadge from "../../components/hebergements/HebergementStatusBadge.vue";

definePageMeta({
  middleware: ["is-connected", "check-hebergement-id-param"],
});

const getFileUploadErrorMessage = fileUtils.getFileUploadErrorMessage;
const hebergementUtils = eigUtils;
const config = useRuntimeConfig();

const toaster = useToaster();
const log = logger("pages/hebermgents/[[hebergementId]]");

const hebergementStore = useHebergementStore();

const route = useRoute();
const hebergementId = ref(route.params.hebergementId);

const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();

useHead({
  title: "Fiche hébergement | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: hebergementId.value
        ? "Page détaillant un hébergement."
        : "Page de création d'un hébergement.",
    },
  ],
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/hebergements/liste",
    text: "Mes hébergements",
  },
  {
    text: hebergementId.value
      ? `Hébergement ${hebergementStore.hebergementCourant.nom}`
      : "Nouvel hébergement",
  },
];

const uploadFiles = async (hebergement) => {
  try {
    await hebergementStore.uploadAllFiles(hebergement);
  } catch (error) {
    const description = getFileUploadErrorMessage(
      error?.fileName,
      error?.data?.name,
    );
    toaster.error({
      titleTag: "h2",
      description,
    });
    resetApiStatut();
    return;
  }
};

async function updateOrCreate(hebergement) {
  log.d("updateOrCreate - IN", { hebergement });
  setApiStatut(
    `${hebergementId.value ? "Modification" : "création"} de l'hébergement en cours`,
  );

  await uploadFiles(hebergement);
  // Sauvegarde de l'hébergement
  try {
    await hebergementStore.updateOrCreate(hebergement, hebergementId.value);
    log.d("hebergement sauvegardé");
    toaster.success({ titleTag: "h2", description: "Hébergement sauvegardé" });

    await navigateTo("/hebergements/liste");
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        error.data.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    });
    log.w("updateOrCreate - erreur", { error });
  } finally {
    resetApiStatut();
  }
}

async function updateOrCreateBrouillon(hebergement) {
  log.d("updateOrCreate - IN", { hebergement });
  setApiStatut(
    `${hebergementId.value ? "Modification" : "création"} de l'hébergement en mode brouillon`,
  );

  await uploadFiles(hebergement);

  // Sauvegarde de l'hébergement
  try {
    const res = await hebergementStore.updateOrCreateBrouillon(
      hebergement,
      hebergementId.value,
    );
    log.d("hebergement sauvegardé");
    toaster.success({ titleTag: "h2", description: "Hébergement sauvegardé" });

    await navigateTo(`/hebergements/${res}`);
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        error.data.message ??
        "Erreur lors de la sauvegarde de l'hébergement en mode brouillon",
    });
    log.w("updateOrCreate - erreur", { error });
  } finally {
    resetApiStatut();
  }
}

async function activate(hebergement) {
  log.d("updateOrCreate - IN", { hebergement });
  setApiStatut(
    `${hebergementId.value ? "Modification" : "création"} de l'hébergement en mode brouillon`,
  );
  await uploadFiles(hebergement);

  try {
    await hebergementStore.activate(hebergement, hebergementId.value);
    log.d("hebergement sauvegardé");
    toaster.success({ titleTag: "h2", description: "Hébergement sauvegardé" });

    await navigateTo("/hebergements/liste");
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        error.data.message ??
        "Erreur lors de la sauvegarde de l'hébergement en mode brouillon",
    });
    log.w("updateOrCreate - erreur", { error });
  } finally {
    resetApiStatut();
  }
}

async function desactivate() {
  log.d("desactivate - IN");
  setApiStatut(`Désactivation de l'hébergement`);

  try {
    await hebergementStore.desactivate(hebergementId.value);
    log.d("hebergement désactivé");
    toaster.success({ titleTag: "h2", description: "Hébergement désactivé" });

    await navigateTo("/hebergements/liste");
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        error.data.message ??
        "Erreur lors de la desactivation de l'hébergement",
    });
    log.w("desactivate - erreur", { error });
  } finally {
    resetApiStatut();
  }
}

async function reactivate() {
  log.d("reactivate - IN");
  setApiStatut(`Réactivation de l'hébergement`);

  try {
    await hebergementStore.reactivate(hebergementId.value);
    log.d("hebergement réactivé");
    toaster.success({ titleTag: "h2", description: "Hébergement réactivé" });

    await navigateTo("/hebergements/liste");
  } catch (error) {
    toaster.error({
      titleTag: "h2",
      description:
        error.data.message ?? "Erreur lors de la réactivation de l'hébergement",
    });
    log.w("reaactivate - erreur", { error });
  } finally {
    resetApiStatut();
  }
}
</script>

<style scoped>
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
