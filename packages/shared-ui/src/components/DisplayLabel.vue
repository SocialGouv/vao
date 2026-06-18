<template>
  <div :class="['container', !isValid ? 'container--error' : '']">
    <div>
      <dl class="fr-text--sm fr-pl-0">
        <dt v-if="labelVisible">{{ input.label }} :</dt>
        <dd>
          {{ displayValue ? displayValue : "-" }}
        </dd>
      </dl>
    </div>
    <p v-if="!isValid" class="fr-error-text" role="alert" aria-live="polite">
      {{ errorMessage || "Champ invalide" }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from "vue";
import { InputTypes } from "../constantes/input-types";

defineEmits(["emitComment"]);

type DisplayInputType = (typeof InputTypes)[keyof typeof InputTypes];

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
      return Object.values(InputTypes).includes(value.inputType);
    },
  },
  value: {
    required: true,
    type: null as unknown as PropType<unknown>,
  },
});

const displayValue = computed(() => {
  const inputHandlers = {
    [InputTypes.RAW]: () => props.value,
    [InputTypes.TEXT]: () =>
      props.value !== null && props.value !== undefined
        ? String(props.value)
        : null,
    [InputTypes.NUMBER]: () => {
      const val = props.value as string | number | undefined;
      if (val === undefined || val === null) return null;
      const strVal = typeof val === "string" ? val : String(val);
      return isNaN(parseInt(strVal)) ? null : parseInt(strVal);
    },
    [InputTypes.RADIO]: () => {
      const options = props.input.options;
      const val = props.value;
      if (!options) return null;
      const key = val !== undefined && val !== null ? String(val) : undefined;
      return key && Object.keys(options).includes(key) ? options[key] : null;
    },
    [InputTypes.MULTISELECT]: () =>
      Array.isArray(props.value)
        ? (props.value as unknown[]).join(" / ")
        : null,
    [InputTypes.TO_FORMAT]: () =>
      props.value && typeof props.input.formatter === "function"
        ? props.input.formatter(props.value)
        : null,
    [InputTypes.TABLE]: () => (Array.isArray(props.value) ? props.value : null),
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
}

.display-info-bloc {
  position: relative;
  width: 100%;
}

.container--error .read-only-label,
.container--error .read-only-value {
  color: var(--text-default-error);
}

dl {
  display: grid;
  grid-template-columns: 220px 1fr;
  row-gap: 0.5rem;
  column-gap: 1rem;
  margin: 0;
}
dd {
  padding-left: 0;
}
dt {
  font-weight: bold;
}
</style>
