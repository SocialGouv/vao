<template>
  <TitleWithIcon
    icon="fr-icon-map-pin-2-fill"
    :level="3"
    title-class="fr-text--lead fr-mb-0"
  >
    Séjours (par années)
  </TitleWithIcon>

  <p>Sélectionner les années</p>

  <DsfrTabs
    v-model="selectedTabIndex"
    tab-list-name="display-sejours-tabs"
    :tab-titles="tabTitles"
    :initial-selected-index="initialSelectedIndex"
  >
    <DsfrTabContent
      v-for="(tab, idx) in tabTitles"
      :key="tab.tabId"
      :panel-id="tab.panelId"
      :tab-id="tab.tabId"
      :selected="selectedTabIndex === idx"
      :asc="asc"
    >
      <AgrementsBilanSejourDetails
        :ref="(el) => setSejourDetailsRef(el, idx)"
        :year="Number(tab.title)"
        :bilan-annuel="bilanAnnuelByYear[Number(tab.title)]"
        :agrement-status="props.initAgrement?.statut"
        :agrement-id="props.initAgrement?.id"
      />
    </DsfrTabContent>
  </DsfrTabs>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { TitleWithIcon } from "@vao/shared-ui";

/* =========================
   Types métier
========================= */

interface BilanAnnuel {
  annee: number;
  bilanHebergement: unknown[];
  trancheAge: unknown[];
  typeHandicap: unknown[];
  nbFemmes: number;
  nbHommes: number;
  nbGlobalVacanciers: number;
  nbTotalJoursVacances: number;
}

interface Agrement {
  id?: number;
  statut?: string;
  agrementBilanAnnuel?: BilanAnnuel[];
}

interface TabTitle {
  title: string;
  tabId: string;
  panelId: string;
}

/* =========================
   Props
========================= */

const props = defineProps<{
  initAgrement: Agrement;
  cdnUrl: string;
  modifiable?: boolean;
}>();

/* =========================
   State
========================= */

const initialSelectedIndex = 0;

const selectedTabIndex = ref<number>(initialSelectedIndex);
const asc = ref<boolean>(true);

// Si tu connais le type exact du composant, remplace unknown
const sejourDetailsRefs = ref<unknown[]>([]);

/* =========================
   Methods
========================= */

function setSejourDetailsRef(el: unknown, idx: number): void {
  sejourDetailsRefs.value[idx] = el;
}

/* =========================
   Tabs (years)
========================= */

const currentYear = new Date().getFullYear();
const startYear = 2021;

const tabTitles = computed<TabTitle[]>(() => {
  const years: TabTitle[] = [];

  for (let year = currentYear - 1; year >= startYear; year--) {
    years.push({
      title: `${year}`,
      tabId: `declaration-sejour-tab-${year}`,
      panelId: `declaration-sejour-content-${year}`,
    });
  }

  return years;
});

/* =========================
   Computed bilan par année
========================= */

type BilanByYear = Record<number, BilanAnnuel>;

const bilanAnnuelByYear = computed<BilanByYear>(() => {
  const result: BilanByYear = {};
  const data = props.initAgrement?.agrementBilanAnnuel ?? [];

  data.forEach((bilan) => {
    const year = bilan.annee;

    if (!result[year]) {
      result[year] = {
        ...bilan,
        bilanHebergement: [...bilan.bilanHebergement],
        trancheAge: [...bilan.trancheAge],
        typeHandicap: [...bilan.typeHandicap],
        nbFemmes: bilan.nbFemmes,
        nbHommes: bilan.nbHommes,
        nbGlobalVacanciers: bilan.nbGlobalVacanciers,
        nbTotalJoursVacances: bilan.nbTotalJoursVacances,
      };
    } else {
      result[year].bilanHebergement.push(...bilan.bilanHebergement);

      result[year].trancheAge = Array.from(
        new Set([...result[year].trancheAge, ...bilan.trancheAge]),
      );

      result[year].typeHandicap = Array.from(
        new Set([...result[year].typeHandicap, ...bilan.typeHandicap]),
      );

      result[year].nbFemmes += bilan.nbFemmes;
      result[year].nbHommes += bilan.nbHommes;
      result[year].nbGlobalVacanciers += bilan.nbGlobalVacanciers;
      result[year].nbTotalJoursVacances += bilan.nbTotalJoursVacances;
    }
  });

  return result;
});
</script>
