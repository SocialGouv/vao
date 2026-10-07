<template>
  <div class="container" :class="{ 'container--error': !isValid }">
    <DsfrCheckbox
      :model-value="props.checked"
      :name="props.name"
      :label="props.label"
      :value="props.value"
      :disabled="true"
      :readonly="true"
      :readonly-opacity="1"
      :error-message="isValid ? '' : (errorMessage ?? 'Champ invalide')"
    />
    <span
      v-if="props.required && !props.checked"
      class="fr-mb-4v fr-text--sm fr-error-text"
    >
      À compléter
    </span>
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

.container :deep(.fr-checkbox-group input[type="checkbox"]:not(:checked):disabled ~ label) {
  --background-disabled-grey: #929292;
}
</style>
