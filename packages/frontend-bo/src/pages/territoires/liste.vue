<template>
  <div class="fr-container">
    <h2 class="fr-py-2w">Liste des territoires</h2>
    <TerritoiresDefaultTable />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});
</script>
