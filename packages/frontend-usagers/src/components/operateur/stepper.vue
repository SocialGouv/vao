<template>
  <DsfrStepper :steps="steps" :current-step="currentStep" />
</template>
<script setup>
const props = defineProps({
  step: { type: Number, default: 1, required: false },
});
const steps = ref([
  "Renseignements généraux",
  "Agrément",
  "Protocole transport",
  "Protocole sanitaire",
  "Organisateurs de séjour",
  "Récapitulatif",
]);
const currentStep = computed(() => {
  return props.step ?? 1;
});
</script>
