<template>
  <div class="container">
    <span v-for="(type, idx) in types" :key="idx" role="listitem">
      {{ type }}
    </span>
  </div>
</template>

<script setup>
defineProps({
  types: { type: Array, default: () => [] },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
