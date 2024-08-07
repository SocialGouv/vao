<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>

<script setup>
const props = defineProps({
  step: { type: String, default: eigMenu[0].id, required: false },
});

const steps = eigMenu.map((o) => o.text);

const currentStep = computed(() => {
  return eigMenu.findIndex((o) => o.id === props.step);
});
</script>
