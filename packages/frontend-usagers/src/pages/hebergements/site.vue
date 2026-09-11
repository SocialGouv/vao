<template>
  <div class="fr-container">
    <div class="fr-grid-row">
      <div class="fr-col">
        <DsfrBreadcrumb :links="links" />
        <h1 ref="pageHeadingRef" tabindex="-1">
          Ajouter un nouvel hébergement
        </h1>
        <p class="fr-mb-2w">
          Sauf mention contraire “(optionnel)” dans le label, tous les champs
          sont obligatoires.
        </p>
      </div>
    </div>
    <div class="fr-grid-row">
      <div class="fr-col">
        <HebergementsSiteForm
          :default-back-route="'/hebergements/liste'"
          @submit="onSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToaster } from "@vao/shared-ui";
import { FeatureFlagName } from "@vao/shared-bridge";

definePageMeta({
  middleware: ["is-connected"],
});

const toaster = useToaster();
const userStore = useUserStore();
const pageHeadingRef = ref<HTMLHeadingElement | null>(null);

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
  title: "Ajouter un nouvel hébergement | Vacances Adaptées Organisées",
  meta: [
    {
      name: "description",
      content: "Page d’ajout d’un nouvel hébergement.",
    },
  ],
});

onMounted(() => {
  pageHeadingRef.value?.focus();
});

const links = [
  {
    to: "/",
    text: "Accueil",
  },
  {
    to: "/hebergements/liste",
    text: "Mes hébergements",
  },
  {
    text: "Ajouter un nouvel hébergement",
  },
];

function onSubmit() {
  toaster.info({
    titleTag: "h2",
    description:
      "Cet écran est en cours de construction, l’enregistrement n’est pas encore disponible.",
  });
}
</script>
