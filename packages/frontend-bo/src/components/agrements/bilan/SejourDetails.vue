<template>
  <div>
    <h2 class="fr-text fr-text--lg fr-text--bold">
      Informations sur les vacanciers
    </h2>
    <DisplayInputCommon
      :value="props.bilanAnnuel?.nbGlobalVacanciers"
      :input="
        AgrementDisplayInput.AgrementBilanAnnuelInput['nbGlobalVacanciers']
      "
    />
    <DisplayInputCommon
      :value="props.bilanAnnuel?.nbHommes"
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbHommes']"
    />
    <DisplayInputCommon
      :value="props.bilanAnnuel?.nbFemmes"
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbFemmes']"
    />
    <!-- Tranches d'âge -->
    <AgrementsBilanTranchesAge
      :tranche-age="props.bilanAnnuel?.trancheAge"
      :statut="props.agrementStatus"
    />
    <DisplayInputCommon
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['trancheAge']"
      :value="props.bilanAnnuel?.trancheAge"
    />

    <DisplayInputCommon
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['typeHandicap']"
      :value="props.bilanAnnuel?.typeHandicap"
    />

    <div class="fr-my-2w separator"></div>

    <!-- Hébergements -->
    <AgrementsBilanHebergements
      ref="hebergementsRef"
      :hebergements="props.bilanAnnuel?.bilanHebergement || []"
    />

    <!-- Jours de vacances -->
    <DisplayInputCommon
      :value="props.bilanAnnuel?.nbTotalJoursVacances"
      :input="
        AgrementDisplayInput.AgrementBilanAnnuelInput['nbTotalJoursVacances']
      "
    />
  </div>
</template>
<script setup lang="ts">
import { DisplayInputCommon, AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  year: { type: Number, required: true },
  sejours: { type: Array, default: () => [] },
  bilanAnnuel: { type: Object, default: () => ({}) },
  agrementStatus: { type: String, default: null },
  agrementId: { type: Number, default: null },
});
</script>
