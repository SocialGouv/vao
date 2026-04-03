<template>
  <div class="container" :class="{ 'container--error': !isValid }">
    <div v-if="labelVisible" class="fr-col-10">
      <span class="read-only-label">{{ input.label }}</span>
    </div>

    <div class="fr-col-10">
      <div class="read-only-box">
        <span class="read-only-value" :class="{ 'is-empty': !displayValue }">
          <slot :value="displayValue">
            {{ displayValue || "—" }}
          </slot>
        </span>
      </div>
    </div>

    <p v-if="!isValid" class="fr-error-text" role="alert" aria-live="polite">
      {{ errorMessage || "Champ invalide" }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import displayInput from "~/utils/display-input";

defineEmits(["emitComment"]);

type DisplayInputType =
  (typeof displayInput.InputTypes)[keyof typeof displayInput.InputTypes];

interface DisplayInputOption {
  inputType: DisplayInputType;
  label: string;
  options?: Record<string, string>;
  formatter?: (value: unknown) => string;
}

const props = defineProps({
  labelVisible: {
    type: Boolean,
    default: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  errorMessage: {
    type: String,
    default: "",
  },
  input: {
    type: Object as PropType<DisplayInputOption>,
    required: true,
    validator: (value: DisplayInputOption) => {
      if (!value.inputType || !value.label || !value.label.length) {
        return false;
      }
      return Object.values(displayInput.InputTypes).includes(value.inputType);
    },
  },
  value: {
    required: true,
    type: null as unknown as PropType<unknown>,
  },
});

const displayValue = computed(() => {
  const inputHandlers = {
    [displayInput.InputTypes.RAW]: () => props.value,
    [displayInput.InputTypes.TEXT]: () =>
      props.value !== null && props.value !== undefined
        ? String(props.value)
        : null,
    [displayInput.InputTypes.NUMBER]: () => {
      const val = props.value as string | number | undefined;
      if (val === undefined || val === null) return null;
      const strVal = typeof val === "string" ? val : String(val);
      return isNaN(parseInt(strVal)) ? null : parseInt(strVal);
    },
    [displayInput.InputTypes.RADIO]: () => {
      const options = props.input.options;
      const val = props.value;
      if (!options) return null;
      const key = val !== undefined && val !== null ? String(val) : undefined;
      return key && Object.keys(options).includes(key) ? options[key] : null;
    },
    [displayInput.InputTypes.MULTISELECT]: () =>
      Array.isArray(props.value)
        ? (props.value as unknown[]).join(" / ")
        : null,
    [displayInput.InputTypes.TO_FORMAT]: () =>
      props.value && typeof props.input.formatter === "function"
        ? props.input.formatter(props.value)
        : null,
    [displayInput.InputTypes.TABLE]: () =>
      Array.isArray(props.value) ? props.value : null,
  };

  const handler = inputHandlers[props.input.inputType];
  return handler ? handler() : "error";
});
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: left;
  align-items: start;
  margin-bottom: 1em;
}

.display-info-bloc {
  position: relative;
  width: 100%;
}

.container--error .read-only-label,
.container--error .read-only-value {
  color: var(--text-default-error);
}
.read-only-box {
  width: 100%;
  min-height: 2.2rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fafafa;
}

.read-only-value.is-empty {
  color: #999;
  font-style: italic;
}
</style>
