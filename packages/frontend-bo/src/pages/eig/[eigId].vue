<template>
  <Synthese :eig="eigStore.currentEig ?? {}" />
</template>

<script setup>
import Synthese from "~/components/eig/Synthese.vue";

const log = logger("pages/eig/[eigId]");

definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const eigStore = useEigStore();

const route = useRoute();

onMounted(async () => {
  try {
    await eigStore.setCurrentEig(route.params.eigId);
  } catch (e) {
    log.w(e);
    navigateTo("/eig");
  }
});
</script>

<style scoped lang="scss"></style>
