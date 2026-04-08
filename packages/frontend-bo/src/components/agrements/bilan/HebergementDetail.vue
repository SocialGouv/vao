<template>
  <div class="cells">
    <div class="cell">
      <DisplayInputCommon
        :value="props.hebergement?.nomHebergement"
        :input="AgrementDisplayInput.IAgrementProjets['nomHebergement']"
        :label-visible="false"
      />
    </div>
    <div class="cell">
      <DisplayInputCommon
        :value="adresseLabel"
        :input="AgrementDisplayInput.IAgrementProjets['adresseLabel']"
        :label-visible="false"
      />
    </div>
    <div class="cell">
      <AgrementsBilanSelectMonths :default-selected="props.hebergement?.mois" />
    </div>
    <DisplayInputCommon
      :value="props.hebergement?.nbJours"
      :input="AgrementDisplayInput.IAgrementProjets['nbJours']"
      :label-visible="false"
    />
    <DisplayInputCommon
      :value="props.hebergement?.nbVacanciers"
      :input="AgrementDisplayInput.IAgrementProjets['nbVacanciers']"
      :label-visible="false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { AgrementDisplayInput, DisplayInputCommon } from "@vao/shared-ui";

const props = defineProps({
  statut: {
    type: String,
    required: true,
  },
  hebergement: {
    type: Object,
    required: true,
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
