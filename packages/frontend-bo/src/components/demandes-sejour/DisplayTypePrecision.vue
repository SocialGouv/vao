<template>
  <div class="container">
    <div>{{ props.typePrecision }}</div>
    <pre v-if="props.commentaire">{{ props.commentaire }}</pre>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  typePrecision: { required: true, type: String },
  commentaire: { default: null, type: String },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;
  height: 100%;
}
</style>
