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
import { statusUser } from "@vao/shared";

type UserStatut = (typeof statusUser.status)[keyof typeof statusUser.status];

const props = defineProps<{
  statut: UserStatut;
  small?: boolean;
}>();

const type = computed(() => {
  switch (props.statut) {
    case statusUser.status.NEED_EMAIL_VALIDATION:
      return "new";
    case statusUser.status.VALIDATED:
      return "success";
    case statusUser.status.NEED_SIRET_VALIDATION:
      return "warning";
    case statusUser.status.BLOCKED:
      return "error";
    default:
      return "info";
  }
});
</script>
