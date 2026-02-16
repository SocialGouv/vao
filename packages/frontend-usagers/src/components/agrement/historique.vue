<template>
  <div>
    <h1>Historique</h1>
    <ol class="cards">
      <li v-for="entry in history" :key="entry.id">
        <AgrementEtapeHistorique :entry="entry" />
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import type { AgrementHistoryItem } from "@vao/shared-bridge";

const props = defineProps<{
  history?: AgrementHistoryItem[];
}>();

const history = computed(() => props.history ?? []);
</script>

<style scoped lang="scss">
li::marker {
  content: "";
}
.cards {
  list-style-type: none;
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  gap: 8px;
  padding: 0;
  margin: 0;
}
.cards li {
  margin: 0;
  padding: 0;
}
</style>
