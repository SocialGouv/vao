<template>
  <Synthese :eig="eigStore.currentEig ?? {}" />
</template>

<script setup>
import Synthese from "~/components/eig/Synthese.vue";

definePageMeta({
  middleware: ["is-connected", "check-role", "check-eig-id-params"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const eigStore = useEigStore();

const route = useRoute();

onMounted(async () => {
  try {
    await eigStore.setCurrentEig(route.params.eigId);
  } catch (e) {
    navigateTo("/eig");
    throw e;
  }
});
</script>

<style scoped lang="scss"></style>
