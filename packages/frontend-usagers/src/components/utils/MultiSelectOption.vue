<template>
  <button type="button" class="blank-button">
    {{ props.label }}
  </button>
  <span v-if="props.isPointed" class="fr-sr-only">Option focus</span>
</template>

<script setup lang="ts">
const props = defineProps<{
  isPointed: boolean;
  label: string;
}>();
</script>
