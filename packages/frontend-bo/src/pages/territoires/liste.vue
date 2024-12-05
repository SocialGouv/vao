<template>
  <div class="fr-container">
    <h2 class="fr-py-2w">Liste des territoires</h2>
    <TerritoiresDefaultTable ref="dataTable" />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});

const dataTable = ref(null);
</script>
