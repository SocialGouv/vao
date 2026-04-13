<template>
  <div class="select-months">
    <DisplayInputCommon
      :input="AgrementDisplayInput.AgrementProjetsInput.selectedMonths"
      :value="selectedLabels"
    />
  </div>
</template>

<script setup lang="ts">
import { AgrementDisplayInput, DisplayInputCommon } from "@vao/shared-ui";
import { ref } from "vue";
const props = defineProps({
  defaultSelected: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const months = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const selectedLabels = ref<string[]>(
  props.defaultSelected
    ? props.defaultSelected
        .map((num) => months[num - 1])
        .filter((label) => !!label)
    : [],
);
</script>
