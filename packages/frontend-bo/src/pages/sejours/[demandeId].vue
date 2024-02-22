<!--  Doc utilisée pour construire le dsfr tab : https://docs.vue-ds.fr/composants/DsfrTabs-->

<template>
  <div class="fr-container header">
    <h1>Demande : {{ demande.libelle }}</h1>
    <div class="detail-container">
      <div v-for="detail in demandeDetails" :key="detail.name">
        <strong>{{ detail.name }} : </strong>{{ detail.value }}
      </div>
    </div>
    <DsfrTabs
      tab-list-name="display-formulaire"
      :tab-titles="tabTitles"
      initial-selected-index="initialSelectedIndex"
      @select-tab="selectTab"
    >
      <DsfrTabContent
        panel-id="tab-content-0"
        tab-id="tab-0"
        :selected="selectedTabIndex === 0"
        :asc="asc"
      >
        <div v-for="(organisateur, i) in demande.organisateur" :key="i">
          <pre>{{ organisateur }}</pre>
        </div>
        <pre>{{ demande }}</pre>
      </DsfrTabContent>

      <DsfrTabContent
        panel-id=" tab-content-1
        "
        tab-id="tab-1"
        :selected="selectedTabIndex === 1"
        :asc="asc"
      >
        <div>EN CONSTRUCTION : Documents joints</div>
      </DsfrTabContent>
      <DsfrTabContent
        panel-id="tab-content-2"
        tab-id="tab-2"
        :selected="selectedTabIndex === 2"
        :asc="asc"
      >
        <div>EN CONSTRUCTION : historique</div>
      </DsfrTabContent>
    </DsfrTabs>
  </div>
</template>

<script setup>
import { DsfrTabContent, DsfrTabs } from "@gouvminint/vue-dsfr";
import { formatDate } from "date-fns/format";
import { isDemande8Jours } from "~/utils/demande-sejour/statuts";

const route = useRoute();
const demandeStore = useDemandeSejourStore();

const demande = demandeStore.getById(route.params.idDemande);
const demandeDetails = computed(() => [
  {
    name: "Organisme",
    value: demandeStore.organismeTitle(demande.demandeSejourId),
  },
  {
    name: "Date (debut / fin)",
    value: `${formatDate(demande.dateDebut, "dd/MM/yyyy")} - ${formatDate(demande.dateFin, "dd/MM/yyyy")}`,
  },
  { name: "Saison", value: demandeStore.saison(demande.demandeSejourId) },
  {
    name: "Déclaration",
    value: isDemande8Jours(demande.statut)
      ? "Demande à 8 jours"
      : "Demande à 2 mois",
  },
  {
    name: "Statut",
    value: demande.statut,
  },
]);

const tabTitles = [
  { title: " Formulaire" },
  { title: "Documents joints" },
  { title: "historique" },
];

const initialSelectedIndex = 0;

const asc = ref(true);
const selectedTabIndex = ref(initialSelectedIndex);

const selectTab = (idx) => {
  asc.value = selectedTabIndex.value < idx;
  selectedTabIndex.value = idx;
};
</script>

<style scoped>
.header {
  padding: 1em 0em;
}

.detail-container {
  display: flex;
  flex-direction: column;
  padding: 0em 1em;
  margin-bottom: 2em;
}
</style>
