<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row fr-mb-2w">
      <div class="fr-col">
        <h1 ref="pageHeadingRef" tabindex="-1">
          Ajouter un nouvel hébergement
        </h1>
        <HebergementsStepper :step="hash" class="fr-mb-2w" />
        <div v-if="hash === 'site-coordonnees'">
          <HebergementsSiteForm
            :default-back-route="'/hebergements/liste'"
            @submit="onStep1Submit"
          />
        </div>
        <div v-else class="fr-callout">
          <p class="fr-callout__text">Cette étape n’est pas encore définie.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FeatureFlagName } from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";
import type { SiteFormValidationValues } from "~/components/hebergements/siteFormValidation";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const userStore = useUserStore();
const pageHeadingRef = ref<HTMLHeadingElement | null>(null);
const toaster = useToaster();

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

const hash = computed(() => {
  if (route.hash) {
    return route.hash.slice(1);
  }
  return hebergementSiteMenu.menus?.[0]?.id ?? "site-coordonnees";
});

const titles = computed(() => hebergementSiteMenu.titles());

watch(
  hash,
  (id) => {
    useHead({
      title: titles.value[`#${id}`],
    });
  },
  { immediate: true },
);

async function onStep1Submit(site: SiteFormValidationValues) {
  if (!site.adresse) {
    return;
  }

  toaster.success({ titleTag: "h2", description: "Adresse validée" });
  return;
}
</script>
