<template>
  <DsfrBadge
    :small="small"
    :type="badgeType"
    style="margin-left: 1ex"
    :label="label"
    class="pointer"
  />
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
  type: {
    required: true,
    type: String,
    validator: (value: string) => ["bo", "fu"].includes(value),
  },
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

const caseBo = () => {
  switch (props.typeDepot) {
    case AGREMENT_TYPE_DEPOT.PREMIER:
      return "new";
    case AGREMENT_TYPE_DEPOT.RENOUVELLEMENT:
      return "success";
    case AGREMENT_TYPE_DEPOT.EXISTANT:
      return "info";
    default:
      return "info";
  }
};

const caseFo = () => {
  switch (props.typeDepot) {
    case AGREMENT_TYPE_DEPOT.PREMIER:
      return "new";
    case AGREMENT_TYPE_DEPOT.RENOUVELLEMENT:
      return "success";
    case AGREMENT_TYPE_DEPOT.EXISTANT:
      return "info";
    default:
      return "info";
  }
};

const badgeType = computed(() => (props.type === "bo" ? caseBo() : caseFo()));
</script>
