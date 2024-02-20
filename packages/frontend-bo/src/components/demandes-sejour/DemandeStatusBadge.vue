<template>
  <DsfrBadge :small="true" :type="type" :label="props.statut" />
</template>

<script setup>
import { demandeStatusSejour } from "~/utils/demandes-sejour/enum";
import { DsfrBadge } from "@gouvminint/vue-dsfr";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) =>
      [
        demandeStatusSejour.EN_COURS,
        demandeStatusSejour.TRANSMISE,
        demandeStatusSejour.ATTENTE_HEBERGEMENT,
        demandeStatusSejour.VALIDEE,
        demandeStatusSejour.A_MODIFIER,
        demandeStatusSejour.ATTENTE_8_JOUR,
        demandeStatusSejour.REFUSEE,
      ].includes(value),
  },
});

const type = computed(() => {
  switch (props.statut) {
    case demandeStatusSejour.EN_COURS:
    case demandeStatusSejour.TRANSMISE:
      return "new";
    case demandeStatusSejour.VALIDEE:
      return "success";
    case demandeStatusSejour.ATTENTE_8_JOUR:
    case demandeStatusSejour.ATTENTE_HEBERGEMENT:
    case demandeStatusSejour.A_MODIFIER:
      return "warning";
    case demandeStatusSejour.REFUSEE:
      return "error";
    default:
      return "union";
  }
});
</script>
