<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des agréments</h1>
    <AgrementsListe />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-feature-flags"],
});
</script>
