<template>
  <div class="container" :class="{ 'container--error': !isValid }">
    <DsfrCheckbox
      :model-value="props.checked"
      :name="props.name"
      :label="props.label"
      :value="props.value"
      :required="props.required"
      :disabled="true"
      :readonly="true"
      :readonly-opacity="1"
      :error-message="isValid ? '' : (errorMessage ?? 'Champ invalide')"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  label: { type: String, required: true },
  name: { type: String, required: true },
  checked: { type: Boolean, default: false },
  value: { type: Boolean, default: true },
  required: { type: Boolean, default: false },
  isValid: { type: Boolean, default: true },
  errorMessage: { type: String, default: "" },
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1em;
}

.container :deep(.fr-label) {
  color: var(--text-default-grey);
}
</style>
