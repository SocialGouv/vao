<template>
  <TitleWithIcon
    icon="fr-icon-map-pin-2-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Séjours (par années)
  </TitleWithIcon>
  <p class="light-decisions-text-text-default-info fr-text--xs">
    <span class="fr-icon-info-fill" aria-hidden="true"></span>
    Ces informations ont été automatiquement remplies à partir de vos
    déclarations de séjour. Veuillez les vérifier et les corriger si nécessaire.
  </p>
  <p>Sélectionner les années</p>
  <p class="fr-hint-text">Toutes les années doivent être renseignées</p>
  <DsfrTabs
    v-model="selectedTabIndex"
    tab-list-name="display-sejours-tabs"
    :tab-titles="tabTitles"
    :initial-selected-index="initialSelectedIndex"
    @update:model-value="selectTab"
  >
    <DsfrTabContent
      v-for="(tab, idx) in tabTitles"
      :key="tab.tabId"
      :panel-id="tab.panelId"
      :tab-id="tab.tabId"
      :selected="selectedTabIndex === idx"
      :asc="asc"
    >
      <AgrementBilanSejourDetails
        :year="parseInt(tab.title)"
        :sejours="sejoursForSelectedYear"
        :agrement-status="props.initAgrement?.statut"
      />
    </DsfrTabContent>
  </DsfrTabs>
</template>

<script setup>
import { TitleWithIcon } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
});

const initialSelectedIndex = 0;

const selectedTabIndex = ref(initialSelectedIndex);
const asc = ref(true);

const currentYear = new Date().getFullYear();
const startYear = 2021;
const tabTitles = computed(() => {
  const years = [];
  for (let year = currentYear - 1; year >= startYear; year--) {
    years.push({
      title: `${year}`,
      tabId: `declaration-sejour-tab-${year}`,
      panelId: `declaration-sejour-content-${year}`,
    });
  }
  return years;
});

const selectedYear = computed(() => {
  return tabTitles.value[selectedTabIndex.value]?.title;
});

const sejoursForSelectedYear = computed(() => {
  if (!props.initAgrement?.agrementSejours) return [];
  return props.initAgrement.agrementSejours.filter((sejour) =>
    sejour.mois?.some((mois) => Math.floor(mois / 100) === selectedYear.value),
  );
});
console.log("initAgrement", props.initAgrement);
console.log(
  "Séjours pour l'année",
  selectedYear.value,
  ":",
  sejoursForSelectedYear.value,
);

const selectTab = async (idx) => {
  asc.value = selectedTabIndex.value < idx;
  console.log("selectedTabIndex:", selectedTabIndex.value);
  // load data

  // if (idx === 0 && !historique.value) {
  //   executeHistorique();
  // }

  // if (idx === 3) {
  //   await demandeSejourStore.readMessages(route.params.declarationId);
  //   demandeSejourStore.fetchMessages(route.params.declarationId);
  // }
};
</script>
