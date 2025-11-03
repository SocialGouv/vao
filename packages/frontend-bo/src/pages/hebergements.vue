import { DsfrTabsV2 } from '@vao/shared-ui';
<template>
  <div class="fr-container">
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
  </div>
</template>

<script setup>
import { DsfrTabsV2 } from "@vao/shared-ui";

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const route = useRoute();

const tabs = [
  {
    label: "Tous les hébergements",
    tabId: "tabpanel-tous",
    tabPanelId: "tabpanel-tous-panel",
    href: "tous",
  },
  {
    label: "Hebergements liés à des séjours",
    tabId: "tabpanel-lies-a-des-sejours",
    tabPanelId: "tabpanel-lies-a-des-sejours-panel",
    href: "lies-a-des-sejours",
  },
];

const defaultTab = tabs.findIndex(({ href }) => route.name.includes(href));

const activeTab = ref(defaultTab !== -1 ? defaultTab : 0);
if (defaultTab === -1) {
  navigateTo(`/hebergements/${tabs[activeTab.value].href}`);
}

const updatePage = (index) => {
  navigateTo(`/hebergements/${tabs[index].href}`);
};
</script>
