<template>
  <Hebergement
    :init-nom="hebergementStore.hebergementCourant.nom"
    :caracteristiques="hebergementStore.hebergementCourant.caracteristiques"
    label-next="Modifier hébergement"
    @cancel="back"
    @submit="editHebergement"
  ></Hebergement>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-id-demande-sejour"],
});

const nuxtApp = useNuxtApp();
const toaster = nuxtApp.vueApp.$toast;
const log = logger("pages/hebermgents/[hebergementId]");
const hebergementStore = useHebergementStore();

const route = useRoute();
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
