<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>

<script setup>
const props = defineProps({
  step: { type: String, default: agrementMenu.menus[0].id, required: false },
});

const steps = agrementMenu.menus.map((o) => o.text);

const currentStep = computed(() => {
  return agrementMenu.menus.findIndex((o) => o.id === props.step);
});
</script>
