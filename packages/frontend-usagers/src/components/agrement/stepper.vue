<template>
  <DsfrStepper :steps="steps" :current-step="1" />
</template>
<script setup>
const steps = [
  "Coordonnées à vérifier",
  "Dossier de candidature",
  "Bilan des 4 années précédentes",
  "Projets de séjours envisagés pour les 12 prochains mois",
  "Synthèse",
];
</script>
