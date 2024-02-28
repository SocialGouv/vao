<template>
  <div v-if="!!displayValue" class="container">
    <div class="display-info-bloc">
      <div class="fr-col-10">
        <span class="read-only-label">{{ input.label }}</span>
      </div>
      <div class="fr-col-10">
        <span class="read-only-value">{{ displayValue }}</span>
      </div>
      <DsfrButton
        icon="fr-icon-edit-box-line"
        icon-only
        class="display-info-button"
        @click="showComment = !showComment"
      />
    </div>
    <DsfrInput
      v-if="showComment"
      ref="textarea"
      :is-textarea="true"
      label="Commentaire"
      placeholder="Ajouter un commentaire"
      @update:model-value="$emit('emitComment', $event)"
    />
  </div>
</template>

<script setup>
import { InputTypes } from "~/utils/display-input";
import { DsfrButton, DsfrInput } from "@gouvminint/vue-dsfr";

const showComment = ref(false);

defineEmits(["emitComment"]);

const props = defineProps({
  input: {
    required: true,
    validator: (value) => {
      if (!value.inputType || !value.label || !value.label.length) {
        return false;
      }
      return Object.values(InputTypes).includes(value.inputType);
    },
  },
  value: {
    required: true,
    validator: (value, props) => {
      if (props.input.inputType === InputTypes.TEXT) {
        return (
          typeof value === "string" || value === null || value === undefined
        );
      }

      if (props.input.inputType === InputTypes.RADIO && !props.input.options) {
        return false;
      }

      if (
        props.input.inputType === InputTypes.MULTISELECT &&
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
    case InputTypes.TEXT:
      return props.value !== null && props.value !== undefined
        ? props.value.toString()
        : null;
    case InputTypes.NUMBER:
      return isNaN(parseInt(props.value)) ? null : parseInt(props.value);
    case InputTypes.RADIO:
      return Object.keys(props.input.options).includes(props.value.toString())
        ? props.input.options[props.value]
        : null;
    case InputTypes.MULTISELECT:
      return Array.isArray(props.value) ? props.value.join(" / ") : null;
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

.display-info-button {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
