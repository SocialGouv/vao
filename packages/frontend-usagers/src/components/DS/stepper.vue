<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>
<script setup>
const props = defineProps({
  step: { type: String, default: organismeMenus[0].id, required: false },
});

const steps = demandeSejourMenus.map((o) => o.text);
const currentStep = computed(() => {
  return demandeSejourMenus.findIndex((o) => o.id === props.step);
});
</script>
