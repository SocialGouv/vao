<template>
  <div>
    <h2 class="fr-text fr-text--lg fr-text--bold">
      Informations sur les vacanciers
    </h2>
    <DisplayLabel
      :value="props.bilanAnnuel?.nbGlobalVacanciers"
      :input="
        AgrementDisplayInput.AgrementBilanAnnuelInput['nbGlobalVacanciers']
      "
    />
    <DisplayLabel
      :value="props.bilanAnnuel?.nbHommes"
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbHommes']"
    />
    <DisplayLabel
      :value="props.bilanAnnuel?.nbFemmes"
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbFemmes']"
    />
    <!-- Tranches d'âge -->
    <AgrementsBilanTranchesAge
      :tranche-age="props.bilanAnnuel?.trancheAge"
      :statut="props.agrementStatus"
    />
    <DisplayLabel
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['trancheAge']"
      :value="props.bilanAnnuel?.trancheAge"
    />

    <DisplayLabel
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
    <DisplayLabel
      :value="props.bilanAnnuel?.nbTotalJoursVacances"
      :input="
        AgrementDisplayInput.AgrementBilanAnnuelInput['nbTotalJoursVacances']
      "
    />
  </div>
</template>
<script setup lang="ts">
import { DisplayLabel, AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  year: { type: Number, required: true },
  sejours: { type: Array, default: () => [] },
  bilanAnnuel: { type: Object, default: () => ({}) },
  agrementStatus: { type: String, default: null },
  agrementId: { type: Number, default: null },
});
</script>
