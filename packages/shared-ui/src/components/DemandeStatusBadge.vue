<template>
  <DsfrBadge
    :small="small"
    :type="type"
    :label="props.statut"
    class="pointer"
  />
</template>

<script setup>
import { computed } from "vue";
import { DsfrBadge } from "@gouvminint/vue-dsfr";
import status from "../utils/status";

const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) => Object.values(status.defaultStatus).includes(value),
  },
  small: { default: true, type: Boolean },
  type: {
    required: true,
    type: String,
    validator: (value) => ["bo", "fu"].includes(value),
  },
});

const caseBo = () => {
  switch (props.statut) {
    case status.defaultStatus.EN_COURS:
    case status.defaultStatus.EN_COURS_8J:
    case status.defaultStatus.TRANSMISE:
    case status.defaultStatus.ATTENTE_8_JOUR:
    case status.defaultStatus.TRANSMISE_8J:
      return "new";
    case status.defaultStatus.VALIDEE_8J:
    case status.defaultStatus.SEJOUR_EN_COURS:
      return "success";
    case status.defaultStatus.A_MODIFIER:
    case status.defaultStatus.A_MODIFIER_8J:
      return "warning";
    case status.defaultStatus.REFUSEE:
    case status.defaultStatus.REFUSEE_8J:
      return "error";
    default:
      return "union";
  }
};

const caseFo = () => {
  switch (props.statut) {
    case status.defaultStatus.TRANSMISE:
    case status.defaultStatus.TRANSMISE_8J:
    case status.defaultStatus.EN_COURS:
    case status.defaultStatus.EN_COURS_8J:
    case status.defaultStatus.VALIDEE_8J:
    case status.defaultStatus.SEJOUR_EN_COURS:
      return "success";
    case status.defaultStatus.BROUILLON:
      return "info";
    case status.defaultStatus.A_MODIFIER:
    case status.defaultStatus.A_MODIFIER_8J:
    case status.defaultStatus.ATTENTE_8_JOUR:
      return "warning";
    default:
      return "union";
  }
};

const type = computed(() => (props.type === "bo" ? caseBo() : caseFo()));
</script>
