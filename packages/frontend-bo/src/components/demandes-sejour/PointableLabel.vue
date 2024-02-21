<template>
  <Pointable>{{ props.label }}</Pointable>
</template>

<script setup>
import Pointable from "~/components/utils/Pointable.vue";

const props = defineProps({
  label: { required: true, type: String },
});
</script>

<style scoped lang="scss">
.pointer {
  cursor: pointer;
}
</style>
