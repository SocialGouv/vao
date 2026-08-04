<template>
  <DsfrBadge :small="small" :type="badgeType" :label="label" class="fr-ml-1v" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DsfrBadge } from "@gouvminint/vue-dsfr";
import {
  AGREMENT_TYPE_DEPOT,
  AGREMENT_TYPE_DEPOT_OPTIONS,
} from "@vao/shared-bridge";

const props = defineProps({
  small: { default: true, type: Boolean },
  typeDepot: {
    default: AGREMENT_TYPE_DEPOT.EXISTANT,
    type: String as () => AGREMENT_TYPE_DEPOT,
    required: false,
    validator: (value: AGREMENT_TYPE_DEPOT) =>
      Object.values(AGREMENT_TYPE_DEPOT).includes(value),
  },
});

const label = computed(() => {
  return (
    AGREMENT_TYPE_DEPOT_OPTIONS.find((s) => s.value === props.typeDepot)
      ?.text ?? props.typeDepot
  );
});

const badgeType = computed(() => {
  switch (props.typeDepot) {
    case AGREMENT_TYPE_DEPOT.PREMIER:
      return "new";
    case AGREMENT_TYPE_DEPOT.RENOUVELLEMENT:
      return "info";
    case AGREMENT_TYPE_DEPOT.EXISTANT:
      return "success";
    default:
      return "error";
  }
});
</script>
