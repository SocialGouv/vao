<template>
  <div>
    <div>
      <p class="fr-mb-1v fr-text--bold">Tranches d’âge</p>
      <DisplayInputCommon
        :input="AgrementDisplayInput.AgrementBilanAnnuelInput.trancheAge"
        :value="props.trancheAge"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { DisplayInputCommon, AgrementDisplayInput } from "@vao/shared-ui";

const props = defineProps({
  trancheAge: { type: Array, default: () => [] },
  statut: { type: String, required: true },
});
</script>
