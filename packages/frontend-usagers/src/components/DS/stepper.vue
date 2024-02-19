<template>
  <DsfrStepper :steps="steps" :current-step="currentStep" />
</template>
<script setup>
const props = defineProps({
  step: { type: Number, default: 1, required: false },
});
const steps = ref([
  "Informations générales",
  "Organisateurs du séjour",
  "Informations prévisionnelles sur les vacanciers",
  "Informations indicatives sur le personnel",
  "Projet de séjour",
  "Informations sur le transport des vacanciers",
  "Informations sanitaires",
  "Sélection des hébergements",
]);
const currentStep = computed(() => {
  return props.step ?? 1;
});
</script>
