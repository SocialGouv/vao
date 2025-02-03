<template>
  <div class="fr-container">
    <h1>Agents de l’État</h1>
    <UserListe />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});
</script>
