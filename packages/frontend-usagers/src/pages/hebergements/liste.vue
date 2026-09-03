<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Lieux d'hébergements déclarés</h1>
      </div>
    </div>
    <HebergementsListe />
    <div class="fr-grid-row">
      <div class="fr-col">
        <form>
          <div class="fr-fieldset">
            <NuxtLink
              class="fr-btn fr-btn--secondary fr-btn--md inline-flex"
              to="/hebergements"
              icon
              @click="handleNouvelHebergementClick"
            >
              <span aria-hidden="true" class="fr-icon-add-line"></span>
              Ajouter un nouvel hébergement
            </NuxtLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HebergementFunnelOrigin } from "@vao/shared-bridge";

const hebergementStore = useHebergementStore();

useHead({
  title: "Mes hébergements | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page listant les hébergements.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    text: "Mes hébergements",
  },
];

function handleNouvelHebergementClick() {
  hebergementStore.setFunnelOrigin(HebergementFunnelOrigin.MES_HEBERGEMENTS);
}
</script>
