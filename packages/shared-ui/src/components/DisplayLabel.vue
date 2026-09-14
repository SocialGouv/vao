<template>
  <div :class="['container', !isValid ? 'container--error' : '']">
    <div>
      <dl class="fr-text--sm fr-pl-0">
        <dt v-if="labelVisible">{{ input.label }} :</dt>
        <dd>
          <span
            v-if="showRequiredEmpty"
            class="fr-mb-4v fr-text--sm fr-error-text"
          >
            À compléter
          </span>
          <template v-else>
            {{ displayValue ? displayValue : "-" }}
          </template>
        </dd>
      </dl>
    </div>
    <p v-if="!isValid" class="fr-error-text">
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
  labelVisible: { type: Boolean, default: true },
  isValid: { type: Boolean, default: true },
  errorMessage: { type: String, default: "" },
  required: { type: Boolean, default: false },
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

const showRequiredEmpty = computed(
  () =>
    props.required &&
    (displayValue.value === null ||
      displayValue.value === undefined ||
      displayValue.value === ""),
);
</script>
