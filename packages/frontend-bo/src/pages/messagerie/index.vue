<template>
  <div class="fr-container">
    <h1 class="header">Liste des messages par déclaration</h1>
    <DemandesSejourListByMessage />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
