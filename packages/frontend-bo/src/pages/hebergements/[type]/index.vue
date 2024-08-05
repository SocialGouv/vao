<template>
  <div class="fr-container">
    <DsfrTabs
      :tab-list-name="tabListName"
      :tab-titles="tabTitles"
      :initial-selected-index="selectedTabIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <HebergementsSimple ref="tables1" />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <HebergementsPourSejour ref="tables2" />
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
  { title: "Hebergements" },
  { title: "Hebergements dans les séjours" },
];

const selectedTabIndex = ref(route.params.type === "pour-sejours" ? 1 : 0);
const tabListName = "Hébergements";

const asc = ref(true);

const router = useRouter();
const tables1 = ref(null);
const tables2 = ref(null);

const tables = [tables1, tables2];

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
  router.replace({
    query: {},
    params: { type: idx === 1 ? "pour-sejours" : "simple" },
  });
  tables[idx].value.refreshTable();
};
</script>
