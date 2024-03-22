<template>
  <div
    v-if="displayValue !== undefined && displayValue !== null"
    class="container"
  >
    <div class="display-info-bloc">
      <div class="fr-col-10">
        <span class="read-only-label">{{ input.label }}</span>
      </div>
      <div class="fr-col-10">
        <span class="read-only-value">{{ displayValue }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import displayInput from "~/utils/display-input";

defineEmits(["emitComment"]);

const props = defineProps({
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
        Array.isArray(props.value) === false
      ) {
        return false;
      }

      return true;
    },
  },
});

const displayValue = computed(() => {
  switch (props.input.inputType) {
    case displayInput.InputTypes.TEXT:
      return props.value !== null && props.value !== undefined
        ? props.value.toString()
        : null;
    case displayInput.InputTypes.NUMBER:
      return isNaN(parseInt(props.value)) ? null : parseInt(props.value);
    case displayInput.InputTypes.RADIO:
      return Object.keys(props.input.options).includes(props.value?.toString())
        ? props.input.options[props.value]
        : null;
    case displayInput.InputTypes.MULTISELECT:
      return Array.isArray(props.value) ? props.value.join(" / ") : null;
    case displayInput.InputTypes.TO_FORMAT:
      return props.input.formatter(props.value);
    default:
      return "error";
  }
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
</style>
