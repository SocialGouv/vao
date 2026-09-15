<template>
  <div class="fr-container">
    <DsfrBreadcrumb :links="links" />
    <div class="fr-grid-row">
      <div class="fr-col">
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
import { useToaster } from "@vao/shared-ui";
import { FeatureFlagName } from "@vao/shared-bridge";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
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

const hash = computed(() => {
  if (route.hash) {
    useHead({
      title: titles.value[route.hash as keyof typeof titles.value],
    });
    return route.hash.slice(1);
  }
  useHead({
    title: titles.value["#site-coordonnees"],
  });
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

function onSubmit() {
  toaster.info({
    titleTag: "h2",
    description:
      "Cet écran est en cours de construction, l’enregistrement n’est pas encore disponible.",
  });
}

function onStep1Submit() {
  onSubmit();
}
</script>
