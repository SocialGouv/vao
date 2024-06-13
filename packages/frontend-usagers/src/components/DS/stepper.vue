<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>
<script setup>
const props = defineProps({
  step: { type: String, default: organismeMenus[0].id, required: false },
});

const demandeSejourStore = useDemandeSejourStore();
const declarationStatut = computed(() => {
  return demandeSejourStore.demandeCourante.statut;
});

const steps = demandeSejourMenus
  .filter((o) => !o.statutsMasques.includes(declarationStatut.value))
  .map((o) => o.text);
const currentStep = computed(() => {
  return demandeSejourMenus
    .filter((o) => !o.statutsMasques.includes(declarationStatut.value))
    .findIndex((o) => o.id === props.step);
});
</script>
