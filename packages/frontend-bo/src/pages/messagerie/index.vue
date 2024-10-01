<template>
  <div class="fr-container">
    <DemandesSejourListe display="Messagerie" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});
</script>
