<template>
  <div>
    <p class="fr-mb-1v"><b>Type de handicaps</b></p>

    <DisplayInputCommon
      :input="AgrementDisplayInput.IAgrementBilanAnnuel.typeHandicap"
      :value="props.typeDeficiences"
    />
  </div>
</template>

<script setup lang="ts">
import { AgrementDisplayInput, DisplayInputCommon } from "@vao/shared-ui";
const props = defineProps({
  statut: { type: String, required: true },
  typeDeficiences: { type: Array, default: () => [] },
});
</script>
