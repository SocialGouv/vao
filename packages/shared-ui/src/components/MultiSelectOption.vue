<template>
  <button type="button" class="blank-button">
    {{ props.label }}
  </button>
  <span v-if="props.isPointed" class="fr-sr-only">Option focus</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  isPointed: Boolean;
  label: string;
}>();
</script>

<style scoped>
.blank-button {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  text-align: left;
}
</style>
