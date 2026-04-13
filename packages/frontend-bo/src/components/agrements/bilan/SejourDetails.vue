<template>
  <div class="fr-container">
    <h2 class="fr-text fr-text--lg fr-text--bold">
      Informations sur les vacanciers
    </h2>
    <div class="flex-inputs">
      <div class="fr-col-4">
        <DisplayInputCommon
          :value="props.bilanAnnuel?.nbGlobalVacanciers"
          :input="
            AgrementDisplayInput.AgrementBilanAnnuelInput['nbGlobalVacanciers']
          "
        />
      </div>

      <div class="fr-col-4">
        <DisplayInputCommon
          :value="props.bilanAnnuel?.nbHommes"
          :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbHommes']"
        />
      </div>

      <div class="fr-col-4">
        <DisplayInputCommon
          :value="props.bilanAnnuel?.nbFemmes"
          :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbFemmes']"
        />
      </div>
    </div>
    <!-- Tranches d'âge -->
    <AgrementsBilanTranchesAge
      ref="tranchesAgeRef"
      :tranche-age="props.bilanAnnuel?.trancheAge"
      :statut="props.agrementStatus"
      class="fr-mt-8v"
    />
    <!-- Types de déficiences -->
    <AgrementsTypeDeficiences
      ref="typeDeficiencesRef"
      :statut="props.agrementStatus"
      :type-deficiences="props.bilanAnnuel?.typeHandicap"
    />

    <hr class="fr-mt-8v fr-mb-0v" />

    <!-- Hébergements -->
    <AgrementsBilanHebergements
      ref="hebergementsRef"
      :hebergements="props.bilanAnnuel?.bilanHebergement || []"
    />

    <!-- Jours de vacances -->
    <div class="fr-col-6 fr-mt-4v">
      <DisplayInputCommon
        :value="props.bilanAnnuel?.nbTotalJoursVacances"
        :input="
          AgrementDisplayInput.AgrementBilanAnnuelInput['nbTotalJoursVacances']
        "
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { DisplayInputCommon, AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  year: { type: Number, required: true },
  sejours: { type: Array, default: () => [] },
  bilanAnnuel: { type: Object, default: () => ({}) },
  agrementStatus: { type: String, default: null },
  agrementId: { type: Number, default: null },
});

const tranchesAgeRef = ref(null);
const typeDeficiencesRef = ref(null);
const hebergementsRef = ref(null);
</script>

<style scoped>
.flex-inputs {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
  align-items: flex-end;
}
</style>
