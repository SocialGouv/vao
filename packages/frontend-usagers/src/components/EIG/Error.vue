<template>
  <div v-if="isError" class="error fr-py-4v" role="alert">
    <span class="fr-icon-error-line" aria-hidden="true"> {{ message }}</span>
  </div>
</template>

<script setup>
defineProps({
  isError: { type: Boolean, default: false },
  message: { type: String, default: "" },
});
</script>

<style scoped>
.error {
  color: #ce0500;
}
</style>
