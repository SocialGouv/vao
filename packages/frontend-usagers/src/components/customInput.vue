<template>
  <component
    :is="is"
    :id="name"
    :name="name"
    :model-value="value ?? ''"
    :error-message="errorMessage"
    :is-valid="meta.valid"
    v-bind="$attrs"
    @update:model-value="handleChange"
  >
    <template
      v-for="{ name: slotName, template } in slots"
      :key="slotName"
      #[slotName]
    >
      <div v-html="template"></div>
    </template>
  </component>
</template>

<script setup>
import { useField } from "vee-validate";

const props = defineProps({
  name: { type: String, required: true },
  initialValue: { default: () => null },
  defaultValue: { type: Function, default: () => null },
  slots: { type: Array, default: () => [] },
  is: { type: String, required: true },
});

resolveComponent("DsfrCheckbox");

const nameRef = toRef(props, "name");

const { value, errorMessage, handleChange, meta } = useField(nameRef, null, {
  initialValue: props.initialValue ?? props.defaultValue(),
});
</script>
