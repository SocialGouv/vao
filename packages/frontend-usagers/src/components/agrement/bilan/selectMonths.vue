<template>
  <div class="select-months">
    <DsfrMultiselect
      v-if="props.modifiable"
      id="months-select"
      v-model="selectedLabels"
      aria-label="sélectionnez un ou plusieurs mois"
      :button-label="buttonLabel"
      :options="months"
      size="small"
    />
    <UtilsDisplayInput
      v-else
      :input="displayInput.IAgrementProjets.selectedMonths"
      :value="selectedLabels"
    />
  </div>
</template>

<script setup lang="ts">
import { DsfrMultiselect } from "@gouvminint/vue-dsfr";
import { ref, watch } from "vue";
import displayInput from "../../../utils/display-input";
const props = defineProps({
  defaultSelected: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
  modifiable: { type: Boolean, default: false },
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

const emit = defineEmits(["update:selected"]);

function emitSelectedMonths() {
  const values = selectedLabels.value
    .map((label) => months.indexOf(label) + 1)
    .filter((num) => num > 0);
  emit("update:selected", values);
}

watch(selectedLabels, emitSelectedMonths);

const truncate = (label: string) =>
  label.length > 5 ? label.slice(0, 4) + "…" : label;

const buttonLabel = computed(() => {
  if (selectedLabels.value.length === 0) {
    return "Sélection";
  }
  const selectedIndices = selectedLabels.value
    .map((label) => months.indexOf(label) + 1)
    .filter((num: number) => num > 0)
    .sort((a, b) => a - b);

  if (selectedIndices.length === 1) {
    return months[selectedIndices[0] - 1];
  }
  const firstMonth = months[selectedIndices[0] - 1];
  const lastMonth = months[selectedIndices[selectedIndices.length - 1] - 1];
  return `${truncate(firstMonth)}-${truncate(lastMonth)}`;
});
</script>
