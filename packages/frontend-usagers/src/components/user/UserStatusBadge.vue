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
import { STATES as userStatut } from "../../helpers/users";
const props = defineProps({
  statut: {
    required: true,
    type: String,
    validator: (value) => Object.values(userStatut).includes(value),
  },
  small: { default: true, type: Boolean },
});

const type = computed(() => {
  switch (props.statut) {
    case userStatut.NEED_EMAIL_VALIDATION:
      return "new";
    case userStatut.VALIDATED:
      return "success";
    case userStatut.NEED_INFOS:
      return "warning";
    default:
      return "union";
  }
});
</script>
