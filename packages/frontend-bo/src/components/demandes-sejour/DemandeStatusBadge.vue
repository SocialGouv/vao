<template>
  <DsfrBadge :small="true" :type="type" :label="props.statut" class="pointer" />
</template>

<script setup>
import { demandeSejourStatut } from "~/utils/demandes-sejour/enum";
import { DsfrBadge } from "@gouvminint/vue-dsfr";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) => Object.values(demandeSejourStatut).includes(value),
  },
});

const type = computed(() => {
  switch (props.statut) {
    case demandeSejourStatut.EN_COURS:
    case demandeSejourStatut.TRANSMISE:
    case demandeSejourStatut.ATTENTE_8_JOUR:
    case demandeSejourStatut.TRANSMISE_8J:
      return "new";
    case demandeSejourStatut.VALIDEE:
      return "success";
    case demandeSejourStatut.ATTENTE_HEBERGEMENT:
    case demandeSejourStatut.A_MODIFIER:
      return "warning";
    case demandeSejourStatut.REFUSEE:
      return "error";
    default:
      return "union";
  }
});
</script>
