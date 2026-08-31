<template>
  <div>
    <OrganismesWarningNonAgree
      :libelle="organismeStore.libelle"
      :date-fin-validite="organismeStore.dateFinValidite ?? undefined"
    />
    <DemandesSejourDetails v-if="isCurrentDemandeIsAvailable" />
    <DsfrTabsV2
      v-model="activeTab"
      :tabs="tabs"
      @update:model-value="updatePage"
    >
      <div
        :id="tabs[activeTab].tabPanelId"
        :key="route?.name"
        class="fr-tabs__panel fr-tabs__panel--selected"
        role="tabpanel"
        :aria-labelledby="tabs[activeTab].tabId"
        tabindex="0"
      >
        <NuxtPage />
      </div>
    </DsfrTabsV2>
    <DemandesSejourActions
      v-if="isCurrentDemandeIsAvailable"
      class="demande-sejour__actions"
    />
  </div>
</template>

<script setup lang="ts">
import { DsfrTabsV2, useToaster } from "@vao/shared-ui";

definePageMeta({
  layout: "default",
  middleware: ["is-connected"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();
const organismeStore = useOrganismeStore();
const toaster = useToaster();

const unreadMessages = computed(() => {
  const messages = demandeSejourStore.messages ?? [];
  const nb = messages.filter((m) => !m.readAt && m.frontUserId != null).length;
  return nb && nb > 0 ? `(${nb})` : "";
});

const tabs = computed(() => [
  {
    label: "Formulaire",
    tabPanelId: "tabpanel-formulaire-panel",
    tabId: "tabpanel-formulaire",
    href: "formulaire",
  },
  {
    label: "Documents joints",
    tabPanelId: "tabpanel-documents-panel",
    tabId: "tabpanel-documents",
    href: "documents",
  },
  {
    label: "Historique de la déclaration",
    tabPanelId: "tabpanel-historique-panel",
    tabId: "tabpanel-historique",
    href: "historique",
  },
  {
    label: `Messagerie ${unreadMessages.value}`,
    tabPanelId: "tabpanel-messagerie-panel",
    tabId: "tabpanel-messagerie",
    href: "messagerie",
    icon: `${unreadMessages.value ? "feedback-line" : ""}`,
  },
]);

const defaultTab = tabs.value.findIndex(({ href }) =>
  String(route.name ?? "").includes(href),
);

const activeTab = ref(defaultTab !== -1 ? defaultTab : 0);
if (defaultTab === -1) {
  navigateTo(
    `/sejours/${route.params.declarationId}/${tabs.value[activeTab.value].href}`,
  );
}

const declarationId = computed(() => {
  const param = route.params.declarationId;
  const value = Array.isArray(param) ? param[0] : param;
  return Number(value);
});

const declarationIdString = computed(() => String(declarationId.value));

const isCurrentDemandeIsAvailable = computed(() => {
  return (
    demandeSejourStore.currentDemande?.declarationId === declarationId.value
  );
});

const updatePage = async (index: number) => {
  navigateTo(`/sejours/${declarationId.value}/${tabs.value[index].href}`);
  if (tabs.value[index].href === "messagerie") {
    await demandeSejourStore.readMessages(declarationIdString.value);
    demandeSejourStore.fetchMessages(declarationIdString.value);
  }
};
const init = async () => {
  try {
    await demandeSejourStore.getCurrentDemande(declarationId.value);
    await demandeSejourStore.fetchMessages(declarationIdString.value);
    const organismeId = demandeSejourStore.currentDemande?.organismeId;
    if (organismeId) {
      await organismeStore.getOrganisme(organismeId);
    }
  } catch (error: unknown) {
    const httpError = error as { response?: { status?: number } };

    if (httpError.response?.status === 403) {
      toaster.error({
        titleTag: "h2",
        description:
          "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
        role: "alert",
      });
    } else {
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      toaster.error({
        titleTag: "h2",
        title: "Erreur lors de la récupération de la demande",
        description: errorMessage,
        role: "alert",
      });
    }
    navigateTo("/sejours");
    throw error;
  }
};

init();
</script>

<style scoped>
.demande-sejour__actions {
  display: flex;
  margin-top: 1rem;
  margin-bottom: 1rem;
  justify-content: right;
  align-items: center;
  gap: 1rem;
}
</style>
