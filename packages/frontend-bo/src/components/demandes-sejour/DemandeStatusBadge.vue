<template>
  <DsfrBadge :small="true" :type="type" :label="props.statut" class="pointer" />
</template>

<script setup>
import { DsfrBadge } from "@gouvminint/vue-dsfr";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) =>
      Object.values(demandesSejours.statuts).includes(value),
  },
});

const type = computed(() => {
  switch (props.statut) {
    case demandesSejours.statuts.EN_COURS:
    case demandesSejours.statuts.TRANSMISE:
    case demandesSejours.statuts.ATTENTE_8_JOUR:
    case demandesSejours.statuts.TRANSMISE_8J:
      return "new";
    case demandesSejours.statuts.VALIDEE:
      return "success";
    case demandesSejours.statuts.ATTENTE_HEBERGEMENT:
    case demandesSejours.statuts.A_MODIFIER:
      return "warning";
    case demandesSejours.statuts.REFUSEE:
      return "error";
    default:
      return "union";
  }
});
</script>
