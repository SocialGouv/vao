<template>
  <div class="fr-container">
    <DsfrTabs
      v-model="selectedTabIndex"
      :tab-list-name="tabListName"
      :tab-titles="tabTitles"
      :initial-selected-index="selectedTabIndex"
      @update:model-value="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <HebergementsTous ref="tables1" />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <HebergementsLiesADesSejours ref="tables2" />
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const route = useRoute();

const tabTitles = [
  {
    title: "Tous les hébergements",
    tabId: "tab-0",
    panelId: "tab-content-0",
  },
  {
    title: "Hebergements liés à des séjours",
    tabId: "tab-1",
    panelId: "tab-content-1",
  },
];

const selectedTabIndex = ref(
  route.params.type === "lies-a-des-sejours" ? 1 : 0,
);
const tabListName = "Tous les hébergements";

const asc = ref(true);

const tables1 = ref(null);
const tables2 = ref(null);

const tables = [tables1, tables2];

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  navigateTo({
    replace: true,
    query: {},
    params: { type: idx === 1 ? "lies-a-des-sejours" : "tous" },
  });
  tables[idx].value.refreshTable();
};
</script>
