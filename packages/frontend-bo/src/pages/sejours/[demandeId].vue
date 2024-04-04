<template>
  <div v-if="!!demandeStore.currentDemande" class="fr-container header">
    <DemandesSejourDetails />
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
        <DemandesSejourDisplayFormulaire />
      </DsfrTabContent>

      <DsfrTabContent
        panel-id="tab-content-1"
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <DemandesSejourDisplayPj />
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <DemandesSejourHistorique
          v-if="historique"
          :historique="historique.historique ?? []"
        />
        <DsfrAlert v-else-if="error" type="error"
          >Une erreur est survenur durant la récupération de l'historique de la
          déclaration
        </DsfrAlert>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected", "check-role"],
  role: "DemandeSejour",
});

const route = useRoute();

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
  if (idx === 2 && !historique.value) {
    execute();
  }
};

const demandeStore = useDemandeSejourStore();

const {
  data: historique,
  error,
  execute,
} = useFetchBackend(`/sejour/admin/historique/${route.params.demandeId}`, {
  immediate: false,
  method: "GET",
  credentials: "include",
});

onMounted(async () => {
  try {
    await demandeStore.setCurrentDemande(route.params.demandeId);
  } catch (e) {
    navigateTo("/sejours");
  }
});

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "Historique de la déclaration" },
];
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
