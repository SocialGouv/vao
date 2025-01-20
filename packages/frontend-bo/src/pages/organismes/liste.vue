<template>
  <div class="fr-container">
    <h1 class="fr-py-2w">Liste des Organismes</h1>
    <OrganismesListe />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});
</script>
