<template>
  <Hebergement @cancel="back" @submit="addHebergement"></Hebergement>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/hebermgents/new");

async function addHebergement(hebergement) {
  log.d("addHebergement - IN");
  try {
    const url = `/hebergement`;
    const data = await $fetchBackend(url, {
      method: "POST",
      body: {
        nom: hebergement.nom,
        caracteristiques: hebergement,
      },
      credentials: "include",
    });
    log.d("hebergement sauvegardé");
    toaster.success("Hébergement sauvegardé");
    navigateTo("/hebergements/" + data.id);
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
