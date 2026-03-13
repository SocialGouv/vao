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
import { AGREMENT_STATUT, AGREMENT_STATUT_OPTIONS } from "@vao/shared-bridge";

const props = defineProps({
  statut: {
    type: String as () => AGREMENT_STATUT,
    required: true,
    validator: (value: AGREMENT_STATUT) =>
      Object.values(AGREMENT_STATUT).includes(value),
  },
  small: { default: true, type: Boolean },
  type: {
    required: true,
    type: String,
    validator: (value: string) => ["bo", "fu"].includes(value),
  },
});

const label = computed(() => {
  return (
    AGREMENT_STATUT_OPTIONS.find((s) => s.value === props.statut)?.text ??
    props.statut
  );
});

const caseBo = () => {
  switch (props.statut) {
    case AGREMENT_STATUT.TRANSMIS:
    case AGREMENT_STATUT.DEPOSE:
    case AGREMENT_STATUT.VERIF_EN_COURS:
      return "new";

    case AGREMENT_STATUT.PRIS_EN_CHARGE:
    case AGREMENT_STATUT.EN_COURS:
    case AGREMENT_STATUT.COMPLETUDE_CONFIRME:
      return "success";

    case AGREMENT_STATUT.A_MODIFIER:
      return "warning";

    case AGREMENT_STATUT.REFUSE:
      return "error";

    case AGREMENT_STATUT.VALIDE:
      return "success";

    default:
      return "info";
  }
};

const caseFo = () => {
  switch (props.statut) {
    case AGREMENT_STATUT.TRANSMIS:
    case AGREMENT_STATUT.DEPOSE:
    case AGREMENT_STATUT.VERIF_EN_COURS:
    case AGREMENT_STATUT.PRIS_EN_CHARGE:
    case AGREMENT_STATUT.EN_COURS:
    case AGREMENT_STATUT.COMPLETUDE_CONFIRME:
    case AGREMENT_STATUT.VALIDE:
      return "success";

    case AGREMENT_STATUT.BROUILLON:
      return "info";

    case AGREMENT_STATUT.A_MODIFIER:
      return "warning";

    case AGREMENT_STATUT.REFUSE:
      return "error";

    default:
      return "info";
  }
};

const badgeType = computed(() => (props.type === "bo" ? caseBo() : caseFo()));
</script>
