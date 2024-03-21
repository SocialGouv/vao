<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Création d'un nouveau lieu d'hébergement</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col-12">
        <Hebergement @cancel="back" @submit="addHebergement"></Hebergement>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});

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
    text: "Nouvel hébergement",
  },
];

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/hebergement/creation");
const hebergementStore = useHebergementStore();

async function addHebergement(hebergement) {
  log.d("addHebergement - IN");
  try {
    const id = await hebergementStore.addHebergement(hebergement);
    log.d("hebergement sauvegardé");
    toaster.success("Hébergement sauvegardé");
    navigateTo("/hebergements/" + id);
  } catch (error) {
    toaster.error(
      error.data.message ?? "Erreur lors de la sauvegarde de l'hébergement",
    );
    log.w("addHebergement - erreur", { error });
  }
}

function back() {
  navigateTo("/hebergements");
}
</script>

<style scoped></style>
