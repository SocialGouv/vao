<template>
  <div class="fr-container">
    <DemandeSejourListe :display="'Messagerie'" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-organisme-is-complet"],
});
</script>
