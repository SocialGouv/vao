<template>
  <DsfrSelect
    :options="optionsToDisplay"
    :model-value="null"
    :select-id="selectId"
    :disabled="!props.modifiable"
    v-bind="$attrs"
    @update:model-value="addItem"
  >
    <template #label>
      <label
        >{{ props.label }}
        <span v-if="required" class="required">&nbsp;*</span></label
      >
      <DsfrTags :tags="formatedTags" />
    </template>
  </DsfrSelect>
</template>

<script setup>
const props = defineProps({
  required: { type: Boolean, default: false },
  options: { type: Array, required: true },
  values: { type: Array, required: true },
  label: { type: String, required: true },
  modifiable: { type: Boolean, default: true },
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
