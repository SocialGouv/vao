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
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <Hebergement
          v-if="hebergementId"
          :init-hebergement="hebergementStore.hebergementCourant"
          label-next="Modifier hébergement"
          @cancel="back"
          @submit="updateOrCreate"
        ></Hebergement>
        <Hebergement
          v-else
          @cancel="back"
          @submit="updateOrCreate"
        ></Hebergement>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-hebergement-id-param"],
});

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/hebermgents/[[hebergementId]]");

const hebergementStore = useHebergementStore();

const route = useRoute();
const hebergementId = ref(route.params.hebergementId);

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

  try {
    await hebergementStore.updaloadFiles(hebergement);
  } catch (e) {
    toaster.error(e.message ?? "Erreur lors de la sauvegarde de l'hébergement");
    return;
  }

  // Sauvegarde de l'hébergement
  try {
    const id = await hebergementStore.updateOrCreate(
      hebergement,
      hebergementId.value,
    );
    log.d("hebergement sauvegardé");
    toaster.success("Hébergement sauvegardé");

    if (!hebergementId.value && id) {
      return navigateTo("/hebergements/" + id);
    }
  } catch (error) {
    toaster.error(
      error.data.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    );
    log.w("updateOrCreate - erreur", { error });
  }
}

function back() {
  navigateTo("/hebergements/liste");
}
</script>

<style scoped></style>
