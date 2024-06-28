<template>
  <div v-show="props.isDownloading" class="container">
    <span v-show="message">{{ props.message }}</span>
    <img src="/assets/Download.svg" alt="download" height="30" width="30" />
  </div>
</template>

<script setup>
const props = defineProps({
  isDownloading: { type: Boolean, default: false },
  message: { type: String, required: false, default: null },
});
</script>

<style scoped>
.container {
  display: flex;
  margin-top: 1rem;
  margin-bottom: 1rem;
  justify-content: right;
  align-items: center;
  gap: 1rem;
}
</style>
