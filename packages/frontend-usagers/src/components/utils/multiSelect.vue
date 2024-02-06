<template>
  <label>{{ props.label }}</label>
  <DsfrTags :tags="formatedTags"> </DsfrTags>
  <div class="fr-input-group">
    <DsfrSelect
      label=""
      label-visible="false"
      name="sports"
      :required="false"
      :options="optionsToDisplay"
      @update:model-value="addItem"
    />
  </div>
</template>

<script setup>
const log = logger("component/utils/multiSelect");
const props = defineProps({
  options: { type: Array, required: true },
  values: { type: Array, required: true },
  label: { type: String, required: true },
});
const emit = defineEmits(["addItem"]);

const tagsToDisplay = ref([]);

const formatedTags = computed(() => {
  log.d("formatage ! ");
  tagsToDisplay.value = props.values;
  return tagsToDisplay.value.map((t) => {
    return {
      id: t,
      label: t,
      class: "fr-tag--dismiss",
      tagName: "button",
      onClick: (c) => {
        tagsToDisplay.value = tagsToDisplay.value.filter(
          (t) => t !== c.target.id
        );
        emit("addItem", tagsToDisplay.value);
      },
    };
  });
});
const optionsToDisplay = computed(() => {
  return props.options.filter((o) => !tagsToDisplay.value.includes(o.value));
});

function addItem(i) {
  log.d("addItem", i);
  tagsToDisplay.value.push(i);
  emit("addItem", tagsToDisplay.value);
}
</script>

<style scoped></style>
