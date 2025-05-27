<template>
  <Synthese
    :eig="eigStore.currentEig ?? {}"
    :file="eigStore.currentEig?.file"
    @update:file="file"
  />
</template>

<script setup>
import Synthese from "~/components/eig/Synthese.vue";

definePageMeta({
  middleware: ["is-connected", "check-role", "check-eig-id-param"],
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
