<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Hébergement {{ hebergementStore.hebergementCourant.nom }}</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <Hebergement
          :init-hebergement="hebergementStore.hebergementCourant"
          label-next="Modifier hébergement"
          @cancel="back"
          @submit="editHebergement"
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
const log = logger("pages/hebermgents/[hebergementId]");
const hebergementStore = useHebergementStore();

const route = useRoute();

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/hebergements",
    text: "Mes hébergements",
  },
  {
    text: `Hébergement ${hebergementStore.hebergementCourant.nom}`,
  },
];

const hebergementId = route.params.hebergementId;

async function editHebergement(hebergement) {
  log.d("editHebergement - IN");
  try {
    const url = `/hebergement/${hebergementId}`;
    await $fetchBackend(url, {
      method: "POST",
      credentials: "include",
      body: hebergement,
    });
    log.d("hebergement sauvegardé");
    toaster.success("Hébergement sauvegardé");
  } catch (error) {
    toaster.error(
      error.data.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    );
    log.w("editHebergement - erreur", { error });
  }
}

function back() {
  navigateTo("/hebergements");
}
</script>

<style scoped></style>
