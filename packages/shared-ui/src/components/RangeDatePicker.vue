<template>
  <div>
    <span class="fr-label">{{ label }}</span>
    <VDatePicker
      is-range
      :model-value="modelValue"
      timezone="UTC"
      @update:model-value="$emit('update:modelValue', $event)"
    >
      <template #default="{ togglePopover, inputValue }">
        <div
          class="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden date-range-input"
        >
          <DsfrButton
            class="date-range-input-button"
            title="Choix de la date de l'eig"
            icon="fr-icon-calendar-line"
            size="medium"
            tertiary
            no-outline
            type="button"
            @click="togglePopover"
            ><span v-if="inputValue.start" class="date-range-input-label">
              {{ inputValue.start }} -> {{ inputValue.end }}</span
            >
            <span v-else class="date-range-input-label-unselect">
              {{ placeholder }}</span
            >
          </DsfrButton>
          <DsfrButton
            label="Réinitialiser le choix des dates"
            icon="fr-icon-delete-line"
            icon-only
            tertiary
            no-outline
            size="small"
            type="button"
            @click="$emit('update:modelValue', null)"
          />
        </div>
      </template>
    </VDatePicker>
  </div>
</template>

<script setup>
defineEmits(["update:modelValue"]);
defineProps({
  label: { type: String, required: true },
  placeholder: { type: String, default: "Sélectionner une date" },
  modelValue: { type: Object, default: null },
});
</script>

<style scoped>
.date-range-input {
  background-color: var(--background-contrast-grey);
  border-radius: 0.25rem 0.25rem 0 0;
  box-shadow: inset 0 -2px 0 0 var(--border-plain-grey);
  color: var(--text-default-grey);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 3px;
  width: fit-content;
}

.date-range-input-button {
  width: 22rem;
}

.date-range-input-label {
  color: black;
  font-weight: normal;
}

.date-range-input-label-unselect {
  font-weight: normal;
  color: var(--text-default-grey);
  font-style: italic;
}
</style>
