<template>
  <DsfrSelect
    :options="optionsToDisplay"
    :model-value="null"
    :select-id="selectId"
    :disabled="!props.modifiable"
    :error-message="props.errorMessage"
    v-bind="$attrs"
    @update:model-value="addItem"
  >
    <template #label>
      <label>
        {{ props.label }}
      </label>
      <DsfrTags :tags="formatedTags" />
    </template>
  </DsfrSelect>
</template>

<script setup>
const props = defineProps({
  options: { type: Array, required: true },
  values: { type: Array, required: true },
  label: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
  isValid: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
});
const emit = defineEmits(["update"]);

const tagsToDisplay = ref([]);

const formatedTags = computed(() => {
  tagsToDisplay.value = props.values;
  return tagsToDisplay.value.map((t) => {
    return {
      id: t,
      label: t,
      name: t,
      disabled: !props.modifiable,
      class: "fr-tag--dismiss",
      tagName: "button",
      onClick: (c) => {
        tagsToDisplay.value = tagsToDisplay.value.filter(
          (t) => t !== c.target.id,
        );
        emit("update", tagsToDisplay.value);
      },
    };
  });
});
const optionsToDisplay = computed(() => {
  return props.options.filter((o) => !tagsToDisplay.value.includes(o.value));
});

const refSelect = ref();
function addItem(i) {
  refSelect.value.selectedIndex = 0;
  tagsToDisplay.value.push(i);
  emit("update", tagsToDisplay.value);
}

const selectId = random.getRandomId("select");

onMounted(() => {
  refSelect.value = document.getElementById(selectId);
});
</script>

<style scoped></style>
