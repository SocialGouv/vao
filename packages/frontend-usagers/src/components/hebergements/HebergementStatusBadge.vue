<template>
  <DsfrBadge
    :small="small"
    :type="type"
    :label="props.statut"
    no-icon
    class="pointer"
  />
</template>

<script setup>
import { DsfrBadge } from "@gouvminint/vue-dsfr";
import hebergements from "../../utils/hebergements";
const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) => Object.values(hebergements.statuts).includes(value),
  },
  small: { default: true, type: Boolean },
});

const type = computed(() => {
  switch (props.statut) {
    case hebergements.statuts.BROUILLON:
      return "info";
    case hebergements.statuts.ACTIF:
      return "success";
    case hebergements.statuts.DESACTIVE:
      return "warning";
    default:
      return "union";
  }
});
</script>
