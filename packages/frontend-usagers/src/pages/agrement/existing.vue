<template>
  <div class="fr-container fr-py-5w">
    <DsfrBreadcrumb :links="links" />
    <h1 ref="pageHeadingRef" tabindex="-1">Créer mon agrément</h1>
    <p class="fr-mb-3w">
      Renseignez les informations minimales nécessaires pour créer votre
      agrément existant.
    </p>

    <div class="fr-card fr-p-3w">
      <OrganismeAgrement
        :init-agrement="initialAgrement"
        :modifiable="true"
        :show-buttons="true"
        :is-downloading="apiStatus.isDownloading"
        :message="apiStatus.message"
        :cdn-url="`${config.public.backendUrl}/documents/`"
        @update="saveAgrement"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToaster } from "@vao/shared-ui";
import { AGREMENT_TYPE_DEPOT } from "@vao/shared-bridge";

const config = useRuntimeConfig();
const toaster = useToaster();
const log = logger("pages/agrement/nouveau");
const { apiStatus, setApiStatut, resetApiStatut } = useIsDownloading();
const organismeStore = useOrganismeStore();
const pageHeadingRef = ref<HTMLHeadingElement | null>(null);

const links = [{ to: "/", text: "Accueil" }, { text: "Créer mon agrément" }];

const initialAgrement = {
  numero: null,
  dateObtention: null,
  regionObtention: null,
  file: null,
  statut: "VALIDE",
  id: null,
};

definePageMeta({
  middleware: [
    "is-connected",
    "check-organisme-is-complet",
    "check-no-agrement-existing",
  ],
});

useHead({
  title: "Créer mon agrément | Vacances Adaptées Organisées",
  meta: [{ name: "description", content: "Créer un agrément minimaliste" }],
});

onMounted(() => {
  pageHeadingRef.value?.focus();
});

async function saveAgrement(agrementData: Record<string, unknown>) {
  log.i("saveAgrement - IN", { agrementData });
  setApiStatut("Création de l'agrément en cours");

  try {
    const organismeId = organismeStore.organismeCourant?.organismeId;
    if (!organismeId) {
      throw new Error("Organisme introuvable");
    }

    const payload = {
      ...agrementData,
      typeDepot: AGREMENT_TYPE_DEPOT.EXISTANT,
      organismeId,
    };

    await $fetchBackend("/agrements", {
      method: "POST",
      credentials: "include",
      body: payload,
    });

    toaster.success({
      titleTag: "h2",
      description: "Agrément créé avec succès",
    });

    await navigateTo("/");
  } catch (error) {
    log.w("saveAgrement - ERROR", error);
    toaster.error({
      titleTag: "h2",
      description: "Une erreur est survenue lors de la création de l'agrément",
      role: "alert",
    });
  } finally {
    resetApiStatut();
  }
}
</script>
