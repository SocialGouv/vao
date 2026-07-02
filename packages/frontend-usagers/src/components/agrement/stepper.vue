<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>

<script setup>
const agrementStore = useAgrementStore();

const props = defineProps({
  step: {
    type: String,
    default: "agrement-coordonnees",
    required: false,
  },
});

const filteredMenus = computed(() =>
  agrementMenu.menus.filter(
    (m) =>
      m.id !== "agrement-bilan" || Boolean(agrementStore.agrementCourant?.id),
  ),
);

const steps = computed(() => filteredMenus.value.map((o) => o.text));

const currentStep = computed(() => {
  return filteredMenus.value.findIndex((o) => o.id === props.step);
});
</script>
