<template>
  <div class="fr-container">
    <UserListe />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["Compte"],
});
</script>
