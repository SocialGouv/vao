<template>
  <div class="select-months">
    <DsfrMultiselect
      v-if="props.modifiable"
      id="months-select"
      v-model="selectedLabels"
      label="sélectionnez un ou plusieurs mois"
      aria-label="sélectionnez un ou plusieurs mois"
      :button-label="buttonLabel"
      :options="months"
      size="small"
    />
    <UtilsDisplayInput
      v-else
      :input="displayInput.AgrementProjetsInput.selectedMonths"
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
        .filter((label): label is string => !!label)
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

  const firstSelected = selectedIndices[0];
  const lastSelected = selectedIndices[selectedIndices.length - 1];
  if (firstSelected === undefined || lastSelected === undefined) {
    return "Sélection";
  }
  const firstMonth = months[firstSelected - 1];
  const lastMonth = months[lastSelected - 1];
  if (!firstMonth || !lastMonth) {
    return "Sélection";
  }
  if (selectedIndices.length === 1) {
    return firstMonth;
  }
  return `${truncate(firstMonth)}-${truncate(lastMonth)}`;
});
</script>
