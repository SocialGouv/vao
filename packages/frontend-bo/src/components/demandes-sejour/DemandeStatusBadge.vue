<template>
  <DsfrBadge
    :small="small"
    :type="type"
    :label="props.statut"
    class="pointer"
  />
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
  small: { default: true, type: Boolean },
});

const type = computed(() => {
  switch (props.statut) {
    case demandesSejours.statuts.EN_COURS:
    case demandesSejours.statuts.EN_COURS_8J:
    case demandesSejours.statuts.TRANSMISE:
    case demandesSejours.statuts.ATTENTE_8_JOUR:
    case demandesSejours.statuts.TRANSMISE_8J:
      return "new";
    case demandesSejours.statuts.VALIDEE_8J:
      return "success";
    case demandesSejours.statuts.A_MODIFIER:
    case demandesSejours.statuts.A_MODIFIER_8J:
      return "warning";
    case demandesSejours.statuts.REFUSEE:
    case demandesSejours.statuts.REFUSEE_8J:
      return "error";
    default:
      return "union";
  }
});
</script>
