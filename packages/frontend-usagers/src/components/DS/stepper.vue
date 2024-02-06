<template>
  <DsfrStepper :steps="steps" :current-step="currentStep" />
</template>
<script setup>
const props = defineProps({
  step: { type: Number, required: true },
});
const steps = ref([
  "Sélection de l'opérateur",
  "informations générales",
  "informations prévisionnelles sur les vacanciers",
  "informations indicatives sur le personnel",
  "projet de séjour",
  "informations sur le transport des vacanciers",
  "informations sanitaires",
  "Hébergement",
]);
const currentStep = computed(() => {
  return props.step ?? "1";
});
</script>
