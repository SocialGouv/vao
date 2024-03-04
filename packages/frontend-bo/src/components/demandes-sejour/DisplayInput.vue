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
        v-show="comment?.length === 0"
        icon="fr-icon-discuss-line"
        icon-only
        class="display-info-icon"
        tertiary
        no-outline
        @click="showComment = !showComment"
      />
      <DsfrButton
        v-show="comment?.length > 0"
        icon="fr-icon-discuss-fill"
        icon-only
        class="display-info-icon"
        tertiary
        no-outline
        @click="showComment = !showComment"
      />
    </div>
    <DsfrInput
      v-if="showComment"
      ref="textarea"
      :is-textarea="true"
      label="Commentaire"
      placeholder="Ajouter un commentaire"
      :model-value="comment"
      @update:model-value="$emit('emitComment', $event)"
    />
  </div>
</template>

<script setup>
import { DsfrButton, DsfrInput } from "@gouvminint/vue-dsfr";
import displayInput from "~/utils/display-input";

const showComment = ref(false);

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
  comment: { required: false, type: String },
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
      return Object.keys(props.input.options).includes(props.value.toString())
        ? props.input.options[props.value]
        : null;
    case displayInput.InputTypes.MULTISELECT:
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

.display-info-icon {
  position: absolute;
  top: 0;
  right: 0;
  color: #000091;
}
</style>
