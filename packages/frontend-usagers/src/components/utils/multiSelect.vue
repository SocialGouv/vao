<template>
  <label>{{ props.label }}</label>
  <DsfrTags :tags="formatedTags" />
  <div class="fr-input-group">
    <DsfrSelect
      label=""
      label-visible="false"
      :required="false"
      :options="optionsToDisplay"
      @update:model-value="addItem"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  options: { type: Array, required: true },
  values: { type: Array, required: true },
  label: { type: String, required: true },
});
const emit = defineEmits(["add-item"]);

const tagsToDisplay = ref([]);

const formatedTags = computed(() => {
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
        emit("add-item", tagsToDisplay.value);
      },
    };
  });
});
const optionsToDisplay = computed(() => {
  return props.options.filter((o) => !tagsToDisplay.value.includes(o.value));
});

function addItem(i) {
  tagsToDisplay.value.push(i);
  console.log("add-item", i, tagsToDisplay.value);
  emit("add-item", tagsToDisplay.value);
}
</script>

<style scoped></style>
