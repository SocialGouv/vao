<template>
  <div class="container" :class="{ 'container--error': !isValid }">
    <dl>
      <dt v-if="props.labelVisible" class="read-only-label">
        {{ input.label }}:
      </dt>
      <dd class="read-only-value" :class="{ 'is-empty': !displayValue }">
        <slot :value="displayValue">
          {{ displayValue || "—" }}
        </slot>
      </dd>
    </dl>

    <p v-if="!isValid" class="fr-error-text" role="alert" aria-live="polite">
      {{ errorMessage ?? "Champ invalide" }}
    </p>
  </div>
</template>

<script setup>
import displayInput from "../../utils/display-input";

defineEmits(["emitComment"]);

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
    required: true,
    validator: (value) => {
      if (!value.inputType || !value.label || !value.label.length) {
        return false;
      }
      return Object.values(displayInput.InputTypes).includes(value.inputType);
    },
  },
  value: {
    required: true,
    validator: (value, props) => {
      if (props.input.inputType === displayInput.InputTypes.TEXT) {
        return (
          typeof value === "string" || value === null || value === undefined
        );
      }

      if (
        props.input.inputType === displayInput.InputTypes.RADIO &&
        !props.input.options
      ) {
        return false;
      }

      if (
        props.input.inputType === displayInput.InputTypes.MULTISELECT &&
        !!props.value &&
        Array.isArray(props.value) === false
      ) {
        return false;
      }

      return !(
        props.input.inputType === displayInput.InputTypes.TABLE &&
        !!props.value &&
        !Array.isArray(props.value)
      );
    },
  },
});

const displayValue = computed(() => {
  const inputHandlers = {
    [displayInput.InputTypes.RAW]: (props) => props.value,
    [displayInput.InputTypes.TEXT]: (props) =>
      props.value !== null && props.value !== undefined
        ? props.value.toString()
        : null,
    [displayInput.InputTypes.NUMBER]: (props) =>
      isNaN(parseInt(props.value)) ? null : parseInt(props.value),
    [displayInput.InputTypes.RADIO]: (props) =>
      Object.keys(props.input.options).includes(props.value?.toString())
        ? props.input.options[props.value]
        : null,
    [displayInput.InputTypes.MULTISELECT]: (props) =>
      Array.isArray(props.value) ? props.value.join(" / ") : null,
    [displayInput.InputTypes.TO_FORMAT]: (props) =>
      props.value ? props.input.formatter(props.value) : null,
    [displayInput.InputTypes.TABLE]: (props) =>
      Array.isArray(props.value) ? props.value : null,
  };

  const handler = inputHandlers[props.input.inputType];
  return handler ? handler(props) : "error";
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

dl {
  margin: 0;
}

dt {
  display: block;
}

dd {
  margin: 0;
}

.container--error .read-only-value {
  color: var(--text-default-error);
}

.read-only-label {
  color: var(--text-default);
  font-weight: bold;
}

.read-only-value.is-empty {
  color: #999;
  font-style: italic;
}
</style>
