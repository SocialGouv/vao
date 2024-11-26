<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1 v-if="hebergementId">
          Hébergement {{ hebergementStore.hebergementCourant.nom }}
        </h1>
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
          :message="apiStatus.message"
          is-save-visible
          @submit="updateOrCreate"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-hebergement-id-param"],
});

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

async function updateOrCreate(hebergement) {
  log.d("updateOrCreate - IN", { hebergement });
  setApiStatut(
    `${hebergementId.value ? "Modification" : "création"} de l'hébergement en cours`,
  );

  try {
    await hebergementStore.updaloadFiles(hebergement);
  } catch (e) {
    toaster.error({
      titleTag: "h2",
      description: e.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    });
    resetApiStatut();
    return;
  }

  // Sauvegarde de l'hébergement
  try {
    await hebergementStore.updateOrCreate(hebergement, hebergementId.value);
    log.d("hebergement sauvegardé");
    toaster.success({ titleTag: "h2", description: "Hébergement sauvegardé" });

    return await navigateTo("/hebergements/liste");
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
</script>

<style scoped></style>
