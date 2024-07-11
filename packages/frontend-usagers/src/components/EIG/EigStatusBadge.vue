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
import { eigModel } from "@vao/shared";

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
    default:
      return "union";
  }
});
</script>
