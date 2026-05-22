<template>
  <fieldset class="fr-mt-8v">
    <legend class="fr-fieldset__legend fr-text--lead">
      <span class="fr-icon-map-pin-2-fill" aria-hidden="true"></span>
      Séjours (par années)
    </legend>
    <p class="light-decisions-text-text-default-info fr-text--xs">
      <span class="fr-icon-info-fill" aria-hidden="true"></span>
      Ces informations ont été automatiquement remplies à partir de vos
      déclarations de séjour. Veuillez les vérifier et les corriger si
      nécessaire.
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
          :ref="(el) => setSejourDetailsRef(el, idx)"
          :year="parseInt(tab.title)"
          :bilan-annuel="bilanAnnuelByYear[parseInt(tab.title)]"
          :agrement-status="props.initAgrement?.statut"
          :agrement-id="props.initAgrement?.id"
          :modifiable="props.modifiable"
        />
        <p v-if="invalidYears.length > 0" class="fr-error-text fr-mt-2w">
          {{
            invalidYears.length > 1
              ? `Aucun séjour renseigné pour les années ${invalidYears.sort((a, b) => b - a).join(", ")}. Veuillez ajouter au moins un séjour par année.`
              : `Aucun séjour renseigné pour l'année ${invalidYears[0]}. Veuillez ajouter au moins un séjour.`
          }}
        </p>
      </DsfrTabContent>
    </DsfrTabs>
  </fieldset>
</template>

<script setup lang="ts">
import { TitleWithIcon, useToaster } from "@vao/shared-ui";

const props = defineProps({
  initAgrement: { type: Object, required: true },
  cdnUrl: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
});

const toaster = useToaster();

const initialSelectedIndex = 0;

const selectedTabIndex = ref<number>(initialSelectedIndex);
const asc = ref<boolean>(true);
const sejourDetailsRefs = ref<any[]>([]);
const invalidYears = ref<number[]>([]);

function setSejourDetailsRef(el: any, idx: number) {
  sejourDetailsRefs.value[idx] = el;
}

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

const bilanAnnuelByYear = computed(() => {
  const result: Record<number, any> = {};
  const data = props.initAgrement?.agrementBilanAnnuel || [];
  data.forEach((bilan: any) => {
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

const selectTab = async (idx: number) => {
  asc.value = selectedTabIndex.value < idx;
};

async function validateAllYears() {
  let allValid = true;
  const allResults = [];
  const yearsInvalid: number[] = [];

  for (const ref of sejourDetailsRefs.value) {
    if (ref && ref.validateForm) {
      const result = await ref.validateForm();
      if (!result || result === false) {
        allValid = false;
      } else if (result?.annee) {
        if (!result.bilanHebergement || result.bilanHebergement.length === 0) {
          yearsInvalid.push(result.annee);
        }
        allResults.push(result);
      }
    } else {
      allValid = false;
    }
  }

  // Mise à jour de la ref — déclenche le rendu du message d'erreur dans le template
  invalidYears.value = yearsInvalid;

  if (!allValid) {
    toaster.error({
      titleTag: "h2",
      description: "Toutes les années doivent être renseignées et valides.",
    });
    return false;
  }

  return {
    data: allResults,
    sejoursValid: yearsInvalid.length === 0,
    invalidYears: yearsInvalid,
  };
}

defineExpose({
  validateForm: validateAllYears,
});
</script>
