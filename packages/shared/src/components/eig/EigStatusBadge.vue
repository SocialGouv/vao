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
import * as eigModel from "../../models/eig";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) => Object.values(eigModel.Statuts).includes(value),
  },
  small: { default: true, type: Boolean },
});

const type = computed(() => {
  switch (props.statut) {
    case eigModel.Statuts.BROUILLON:
      return "new";
    case eigModel.Statuts.ENVOYE:
      return "success";
    case eigModel.Statuts.LU:
      return "info";
    default:
      return "union";
  }
});
</script>
