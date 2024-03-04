<template>
  <span class="read-only-value">{{
    `${personne.nom ? personne.nom : ""} ${personne.prenom ? personne.prenom : ""} ${personne.fonction ? `, ${personne.fonction}` : ""}  ${personne.email ? `: ${personne.email}` : ""}`
  }}</span>
</template>

<script setup>
defineProps({
  personne: { type: Object, required: true },
});
</script>

<style scoped></style>
