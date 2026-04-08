<template>
  <div class="fr-container">
    <p class="fr-text fr-text--lg">
      <b>Informations sur les vacanciers</b>
    </p>
    <div class="flex-inputs">
      <div class="fr-col-4">
        <DisplayInputCommon
          :value="props.bilanAnnuel?.nbGlobalVacanciers"
          :input="
            AgrementDisplayInput.IAgrementBilanAnnuel['nbGlobalVacanciers']
          "
        />
      </div>

      <div class="fr-col-4">
        <DisplayInputCommon
          :value="props.bilanAnnuel?.nbHommes"
          :input="AgrementDisplayInput.IAgrementBilanAnnuel['nbHommes']"
        />
      </div>

      <div class="fr-col-4">
        <DisplayInputCommon
          :value="props.bilanAnnuel?.nbFemmes"
          :input="AgrementDisplayInput.IAgrementBilanAnnuel['nbFemmes']"
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
      :agrement-bilan-annuel="props.agrementBilanAnnuel"
      :bilan-hebergement="props.bilanAnnuel?.bilanHebergement || []"
      :statut="props.agrementStatus"
    />

    <!-- Jours de vacances -->
    <div class="fr-col-6 fr-mt-4v">
      <DisplayInputCommon
        :value="props.bilanAnnuel?.nbTotalJoursVacances"
        :input="
          AgrementDisplayInput.IAgrementBilanAnnuel['nbTotalJoursVacances']
        "
      />
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { DisplayInputCommon, AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  year: { type: Number, required: true },
  sejours: { type: Array, default: () => [] },
  bilanAnnuel: { type: Object, default: () => ({}) },
  agrementStatus: { type: String, required: true },
  agrementId: { type: String, required: true },
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
