<template>
  <div v-if="!!demandeStore.currentDemande" class="fr-container header">
    <Details />
    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      :initial-selected-index="initialSelectedIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <DisplayFormulaire />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <DisplayPj />
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
import { DsfrTabContent, DsfrTabs } from "@gouvminint/vue-dsfr";
import Details from "~/components/demandes-sejour/Details.vue";
import DisplayFormulaire from "~/components/demandes-sejour/DisplayFormulaire.vue";
import DisplayPj from "~/components/demandes-sejour/DisplayPj.vue";

const route = useRoute();

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
};

const demandeStore = useDemandeSejourStore();

onMounted(async () => {
  try {
    await demandeStore.setCurrentDemande(route.params.demandeId);
  } catch (e) {
    navigateTo("/sejours");
  }
});

const tabTitles = [{ title: " Formulaire" }, { title: "Documents joints" }];
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
