<template>
  <div
    v-if="displayValue !== undefined && displayValue !== null"
    class="container"
  >
    <div
      v-if="props.input.inputType !== displayInput.InputTypes.TABLE"
      class="display-info-bloc"
    >
      <div class="fr-col-10">
        <span class="read-only-label">{{ input.label }}</span>
      </div>
      <div class="fr-col-10">
        <span class="read-only-value">{{ displayValue }}</span>
      </div>
    </div>
    <div v-else>
      <div class="fr-col-10">
        <span class="read-only-label">{{ input.label }}</span>
      </div>
      <UtilsTableFull :headers="header" :data="rows"></UtilsTableFull>
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

const rows = computed(() => {
  const data = props.input.filter
    ? props.input.filter(props.value)
    : props.value;
  return data.map((d) => {
    Object.keys(d).forEach((key) => {
      const headerType = props.input.fields.find((h) => h.value === key);
      if (headerType && headerType?.display !== "text") {
        d[key] = headerType.format(d);
      }
    });
    return d;
  });
});

const header = computed(() => {
  return props.input.fields.map((f) => {
    return {
      column: f.value,
      sorter: f.value,
      text: f.label,
      headerAttrs: {
        class: "suivi",
      },
    };
  });
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
    case displayInput.InputTypes.TABLE:
      return Array.isArray(props.value) ? props.value : null;
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
