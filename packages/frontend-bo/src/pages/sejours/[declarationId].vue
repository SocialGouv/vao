<template>
  <div>
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

<script setup>
import { DsfrTabsV2 } from "@vao/shared";
definePageMeta({
  layout: "default",
  middleware: ["is-connected"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();

const tabs = [
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
    label: "Messagerie",
    tabPanelId: "tabpanel-messagerie-panel",
    tabId: "tabpanel-messagerie",
    href: "messagerie",
  },
  // {
  //   label: "EIG",
  //   tabPanelId: "tabpanel-eig-panel",
  //   tabId: "tabpanel-eig",
  //   href: "eig",
  // },
];

const defaultTab = tabs.findIndex(({ href }) => route.name.includes(href));

const activeTab = ref(defaultTab !== -1 ? defaultTab : 0);
if (defaultTab === -1) {
  navigateTo(
    `/sejours/${route.params.declarationId}/${tabs[activeTab.value].href}`,
  );
}

const isCurrentDemandeIsAvailable = computed(() => {
  return (
    demandeSejourStore.currentDemande?.declarationId ===
    parseInt(route.params.declarationId, 10)
  );
});

const updatePage = (index) => {
  navigateTo(`/sejours/${route.params.declarationId}/${tabs[index].href}`);
};

const init = async () => {
  try {
    await demandeSejourStore.getCurrentDemande(route.params.declarationId);
  } catch (error) {
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
