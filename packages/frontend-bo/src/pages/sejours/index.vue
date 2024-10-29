<template>
  <div class="fr-container">
    <h1 class="header">
      Déclarations à Traiter ({{
        (sejourStore.stats?.transmis ?? 0) +
        (sejourStore.stats?.enCours ?? 0) +
        (sejourStore.stats?.transmis8J ?? 0)
      }})
    </h1>
    <DemandesSejourListe display="Organisme" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const sejourStore = useDemandeSejourStore();
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
