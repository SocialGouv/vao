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
            :init-site="step1Site ?? undefined"
            :default-back-route="'/hebergements/liste'"
            @submit="onStep1Submit"
          />
        </div>
        <div v-else-if="hash === 'site-info-lieu'">
          <HebergementsInformationsSiteForm
            :init-values="siteInfoLieu ?? undefined"
            @submit="onStep2Submit"
            @previous="goToStep('site-coordonnees')"
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
import {
  FeatureFlagName,
  getFunctionalErrorMessage,
  type PostSiteResponse,
} from "@vao/shared-bridge";
import type {
  InformationsSiteFormValues,
  SiteFormValidationValues,
} from "~/components/hebergements/siteFormValidation";
import { useToaster } from "@vao/shared-ui";

definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const userStore = useUserStore();
const hebergementStore = useHebergementStore();
const toaster = useToaster();
const pageHeadingRef = ref<HTMLHeadingElement | null>(null);

const step1Site = ref<SiteFormValidationValues | null>(null);
const siteInfoLieu = ref<InformationsSiteFormValues | null>(null);
const createdSiteId = ref<string | null>(null);

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

  let createdSite: PostSiteResponse;
  try {
    createdSite = await hebergementStore.postSite(site);
    step1Site.value = site;
  } catch (err: unknown) {
    toaster.error({
      titleTag: "h2",
      description:
        err instanceof Error && "code" in err
          ? getFunctionalErrorMessage((err as { code: string }).code)
          : "Une erreur est survenue lors de l'enregistrement du site.",
      role: "alert",
    });
    return;
  }

  createdSiteId.value = createdSite.siteId;
  siteInfoLieu.value = mapSiteToInformationsSiteForm(createdSite);
  await goToStep("site-info-lieu");
}

async function onStep2Submit(values: InformationsSiteFormValues) {
  siteInfoLieu.value = values;

  if (createdSiteId.value) {
    try {
      await hebergementStore.patchSite(createdSiteId.value, values);
    } catch {
      toaster.error({
        titleTag: "h2",
        description:
          "Une erreur est survenue lors de l'enregistrement des informations du site.",
        role: "alert",
      });
      return;
    }
  }

  await goToStep("site-hebergement-detail");
}

function mapSiteToInformationsSiteForm(
  site: PostSiteResponse,
): InformationsSiteFormValues {
  return {
    typeHebergement: site.hebergementTypeValue ?? "",
    description: site.descriptif ?? "",
    responsable: {
      nomPrenom: site.respNomPrenom ?? "",
      telephone: site.respTelephone ?? "",
      email: site.respEmail ?? "",
    },
  };
}

async function goToStep(stepId: string) {
  await navigateTo({ hash: `#${stepId}` });
  await nextTick();
  pageHeadingRef.value?.focus();
}
</script>
