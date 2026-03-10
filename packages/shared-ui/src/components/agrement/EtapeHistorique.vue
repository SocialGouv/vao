<template>
  <div class="card">
    <div class="texte">
      <p class="texte-intitule">{{ typeLabel }}</p>
      <p class="texte-temporalite">
        {{ formatFR(created_at) ?? "" }} -
        <span v-if="type_precision">Statut {{ formatLabel(type_precision) ?? "" }}</span>
      </p>
    </div>
    <p class="user">
      {{ usager_user?.mail ?? "" }}
    </p>
    <p class="user">
      {{ bo_user?.mail ?? "" }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type {
  AgrementHistoryItem,
  AGREMENT_HISTORY_TYPE,
} from "@vao/shared-bridge";
import { formatFR, AGREMENT_HISTORY_LABELS, formatLabel } from "@vao/shared-bridge";

const props = defineProps<{
  entry: AgrementHistoryItem;
}>();
const { type, created_at, type_precision, usager_user, bo_user } = props.entry;
const typeLabel =
  AGREMENT_HISTORY_LABELS[type as AGREMENT_HISTORY_TYPE] ?? type;
</script>
<style scoped lang="scss">
.card {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-height: 86px;
  border-radius: 4px;
  padding: 1rem;
  border: 1px solid
    var(--light-decisions-background-background-alt-grey-active, #cfcfcf);
  @media (max-width: 597px) {
    min-height: 110px;
    height: 110px;
  }
}
.card p {
  margin: 0;
}
.icone--success {
  color: green;
}
.texte {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 10px;
  flex-grow: 1;
}
.texte-intitule {
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  color: var(--light-decisions-artwork-artwork-major-blue-france, #000091);
}
.texte-temporalite {
  font-size: 14px;
}
.entite {
  flex-shrink: 0;
  font-size: 14px;
}
</style>
