<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>
<script setup>
const organismeStore = useOrganismeStore();

const props = defineProps({
  step: {
    type: String,
    default: "info-generales",
    required: false,
  },
});

const steps = organismeMenus
  .menus(organismeStore.isSiegeSocial)
  .map((o) => o.text);
const currentStep = computed(() => {
  return organismeMenus
    .menus(organismeStore.isSiegeSocial)
    .findIndex((o) => o.id === props.step);
});
</script>
