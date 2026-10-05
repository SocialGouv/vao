<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
      </div>
    </div>

    <div class="fr-grid-row">
      <div class="fr-col">
        <h1>Détail du site</h1>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col">
        <p>Site : {{ siteId }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FeatureFlagName } from "@vao/shared-bridge";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const userStore = useUserStore();

const siteId = computed(() => String(route.params.siteId));

const isModuleHebergementEnabled = computed(
  () =>
    !!userStore.user?.featureFlags?.[
      FeatureFlagName.MODULE_SITE_UNITE_HEBERGEMENT
    ],
);

if (!isModuleHebergementEnabled.value) {
  navigateTo("/hebergements/liste");
}

useHead({
  title: "Détail du site | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page de détail d’un site d’hébergement.",
    },
  ],
});
const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/hebergements/sites",
    text: "Mes hébergements",
  },
  {
    text: "Détail du site",
  },
];
</script>
