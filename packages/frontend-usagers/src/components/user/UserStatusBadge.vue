<template>
  <DsfrBadge
    :small="small"
    :type="type"
    :label="props.statut"
    class="pointer"
  />
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { DsfrBadge } from "@gouvminint/vue-dsfr";
import { STATES as userStatut } from "../../helpers/users";

type UserStatut = (typeof userStatut)[keyof typeof userStatut];

const props = defineProps<{
  statut: UserStatut;
  small?: boolean;
}>();

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
