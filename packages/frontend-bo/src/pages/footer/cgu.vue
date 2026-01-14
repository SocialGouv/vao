<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Conditions Générales d'Utilisation (CGU)</h1>
      </div>
    </div>
    <CguValidation />
  </div>
</template>

<script setup lang="ts">
import { CguValidation } from "@vao/shared-ui";

useHead({
  title:
    "Conditions Générales d'Utilisation (CGU) | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de description de l'utilisation des cookies.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Conditions Générales d'Utilisation (CGU)",
  },
];
</script>
