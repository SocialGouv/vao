<template>
  <span class="read-only-value">{{
    `${personne.nom} ${personne.prenom}, ${personne.fonction} : ${personne.email}`
  }}</span>
</template>

<script setup>
defineProps({
  personne: { type: Object, required: true },
});
</script>

<style scoped></style>
