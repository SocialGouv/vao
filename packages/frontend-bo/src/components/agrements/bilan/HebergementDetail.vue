<template>
  <div class="cells">
    <div class="cell">
      <DisplayLabel
        :value="props.hebergement?.nomHebergement"
        :input="AgrementDisplayInput.AgrementProjetsInput['nomHebergement']"
        :label-visible="false"
      />
    </div>
    <div class="cell">
      <DisplayLabel
        :value="adresseLabel"
        :input="AgrementDisplayInput.AgrementProjetsInput['adresseLabel']"
        :label-visible="false"
      />
    </div>
    <div class="cell">
      <AgrementsBilanSelectMonths :default-selected="props.hebergement?.mois" />
    </div>
    <DisplayLabel
      :value="props.hebergement?.nbJours"
      :input="AgrementDisplayInput.AgrementProjetsInput['nbJours']"
      :label-visible="false"
    />
    <DisplayLabel
      :value="props.hebergement?.nbVacanciers"
      :input="AgrementDisplayInput.AgrementProjetsInput['nbVacanciers']"
      :label-visible="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AgrementDisplayInput, DisplayLabel } from "@vao/shared-ui";

const props = defineProps({
  hebergement: {
    type: Object,
    default: null,
  },
});

const adresseLabel = computed(() => {
  const adresse = props.hebergement?.adresse ?? "";
  if (!adresse) return "";

  if (typeof adresse === "object" && adresse.label) {
    return adresse.label;
  }

  if (typeof adresse === "string") {
    return adresse;
  }

  return "";
});
</script>

<style scoped>
.cells {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 40px;
  margin-bottom: 1rem;
  gap: 0 0.5rem;
  align-items: stretch;
}

.cells > * {
  height: 100%;
}

.cells > input {
  outline: 2px solid purple;
}
</style>
