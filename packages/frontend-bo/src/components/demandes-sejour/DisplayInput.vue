<template>
  <div v-if="props.inputType === InputTypes.TEXT">toto</div>
</template>

<script setup>
import { InputTypes } from "~/utils/demande-sejour/display-input";

const props = defineProps({
  inputType: {
    required: true,
    validator: (value) => Object.values(InputTypes).includes(value),
  },
  label: {
    required: true,
    type: String,
  },
  value: {
    required: true,
    validator: (value, props) => {
      console.log(props);
      return true;
    },
  },
});
</script>

<style scoped></style>
