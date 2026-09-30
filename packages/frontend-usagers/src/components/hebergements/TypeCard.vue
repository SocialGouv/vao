<template>
  <div class="fr-fieldset__element fr-col-12">
    <div class="fr-radio-group fr-radio-rich">
      <input
        :id="inputId"
        type="radio"
        :name="name"
        :value="value"
        :checked="checked"
        @change="onChange"
      />
      <label class="fr-label" :for="inputId">
        {{ label }}
        <span v-if="hint" class="fr-hint-text">{{ hint }}</span>
      </label>
      <div class="fr-radio-rich__pictogram" aria-hidden="true">
        <span :class="icon" class="hebergement-type-card__icon"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  name: string;
  value: string;
  label: string;
  icon: string;
  modelValue: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  hint: "",
});

const emit = defineEmits<{ (e: "update:modelValue", value: string): void }>();

const checked = computed(() => props.modelValue === props.value);

const inputId = computed(() => `typeHebergement-${props.value}`);

function onChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.checked) {
    emit("update:modelValue", target.value);
  }
}
</script>

<style scoped>
.hebergement-type-card__icon {
  font-size: 2rem;
}
</style>
