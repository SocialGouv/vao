<template>
  <DsfrStepper :steps="steps" :current-step="currentStep + 1" />
</template>

<script setup lang="ts">
const props = defineProps({
  step: {
    type: String,
    default: "site-coordonnees",
    required: false,
  },
});

const steps = computed(() => hebergementSiteMenu.menus.map((o) => o.text));

const currentStep = computed(
  () => hebergementSiteMenu.menus.findIndex((o) => o.id === props.step) ?? 0,
);
</script>
