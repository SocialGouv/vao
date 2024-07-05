<template>
  <div class="fr-fieldset__element">
    <DsfrFileUpload
      v-if="props.modifiable"
      v-bind="$attrs"
      :error="props.errorMessage"
      @change="changeFile"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modifiable: { type: Boolean, default: true },
  errorMessage: { type: String, default: null },
});

const file = defineModel({ type: Object });

function changeFile(fileList) {
  file.value = fileList.length > 0 ? fileList[0] : null;
}
</script>

<style lang="scss" scoped></style>
