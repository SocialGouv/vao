<template>
  <div class="fr-fieldset fr-mb-0">
    <div class="fr-fieldset__element fr-col-12">
      <DsfrSelect
        :model-value="modelValue"
        :options="options"
        :label="label"
        :name="name"
        :required="required"
        :disabled="!modifiable"
        :error-message="errorMessage"
        :hint="hint"
        default-unselected-text="Sélectionner un hébergement"
        @update:model-value="onChange"
      />
    </div>
    <div v-if="selectedSite" class="fr-fieldset__element fr-col-12">
      <p class="fr-mb-1v fr-text--sm">
        <strong>{{ selectedSite.text }}</strong>
      </p>
      <p v-if="selectedSite.address" class="fr-mt-0 fr-mb-1v fr-text--sm">
        {{ selectedSite.address }}
      </p>
    </div>
    <div v-if="modifiable" class="fr-fieldset__element fr-col-12 fr-mb-0">
      <DsfrButton
        secondary
        no-outline
        type="button"
        :disabled="!modelValue"
        @click="onShowDetails"
      >
        Voir le détail
      </DsfrButton>
    </div>
  </div>
</template>

<script setup lang="ts">
export type SiteSelectOption = {
  text: string;
  value: string;
  address?: string | null;
};

interface DSHebergementSelectProps {
  modelValue?: string;
  label: string;
  options: SiteSelectOption[];
  name: string;
  required?: boolean;
  modifiable?: boolean;
  errorMessage?: string;
  hint?: string;
}

const props = withDefaults(defineProps<DSHebergementSelectProps>(), {
  modelValue: undefined,
  required: true,
  modifiable: true,
  errorMessage: "",
  hint: undefined,
});

const emit = defineEmits<{
  (e: "update:modelValue" | "details", value: string): void;
}>();

function onChange(event: string | number) {
  emit("update:modelValue", String(event));
}

const selectedSite = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
);

function onShowDetails() {
  if (props.modelValue) {
    emit("details", props.modelValue);
  }
}
</script>
