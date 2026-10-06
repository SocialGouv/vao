<template>
  <div>
    <h3 class="fr-text fr-text--lg fr-text--bold">
      Informations sur les vacanciers
    </h3>
    <DisplayLabel
      :value="props.bilanAnnuel?.nbGlobalVacanciers"
      :input="
        AgrementDisplayInput.AgrementBilanAnnuelInput['nbGlobalVacanciers']
      "
      :required="true"
    />
    <DisplayLabel
      :value="props.bilanAnnuel?.nbHommes"
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbHommes']"
      :required="true"
    />
    <DisplayLabel
      :value="props.bilanAnnuel?.nbFemmes"
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['nbFemmes']"
      :required="true"
    />
    <!-- Tranches d'âge -->
    <AgrementsBilanTranchesAge
      :tranche-age="props.bilanAnnuel?.trancheAge"
      :statut="props.agrementStatus"
    />
    <DisplayLabel
      :input="AgrementDisplayInput.AgrementBilanAnnuelInput['trancheAge']"
      :value="props.bilanAnnuel?.trancheAge"
      :required="true"
    />

    <div class="fr-mb-4v">
      <p class="fr-text--bold">
        {{
          AgrementDisplayInput.AgrementBilanAnnuelInput.typeHandicap.label
        }}
      </p>
      <DsfrTags :tags="typeHandicapTags" />
    </div>

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
      :required="true"
    />
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { DisplayLabel, AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  year: { type: Number, required: true },
  sejours: { type: Array, default: () => [] },
  bilanAnnuel: { type: Object, default: () => ({}) },
  agrementStatus: { type: String, default: null },
  agrementId: { type: Number, default: null },
});

const typeHandicapTags = computed(() => {
  const options =
    AgrementDisplayInput.AgrementBilanAnnuelInput.typeHandicap.options ?? {};
  const values = Array.isArray(props.bilanAnnuel?.typeHandicap)
    ? props.bilanAnnuel?.typeHandicap
    : [];
  return values.map((value) => ({
    label: options[value as keyof typeof options] ?? value,
    class: "agrement-tag",
  }));
});
</script>

<style scoped>
:deep(.agrement-tag.fr-tag) {
  background-color: #ADADF9;
  color: #000091;
}
</style>
