<template>
  <DsfrBadge
    v-if="props.statut === eigModel.Statuts.BROUILLON"
    :small="small"
    type="new"
    :label="props.statut"
    class="pointer"
  />
  <div v-else class="container">
    <DsfrBadge
      :small="small"
      :type="dreets.isRead ? 'success' : 'new'"
      :label="`${dreets.isRead ? 'Lu' : 'Non lu'} par la DREETS ${dreets.territoireCode}`"
      class="pointer"
    />
    <DsfrBadge
      :small="small"
      :type="ddets.isRead ? 'success' : 'new'"
      :label="`${ddets.isRead ? 'Lu' : 'Non lu'} par la DDETS  ${ddets.territoireCode}`"
      class="pointer"
    />
  </div>
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
  dreets: { type: Object, required: true },
  ddets: { type: Object, required: true },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 10px;
}
</style>
