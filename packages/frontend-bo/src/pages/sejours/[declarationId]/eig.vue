<template>
  <DemandesSejourEigs :eigs="eigs ?? []" @get-eigs="handlegetEigs" />
</template>

<script setup>
const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();

const eigs = computed(() => demandeSejourStore.eigs);

const handlegetEigs = () => {
  demandeSejourStore.getEigs(route.params.declarationId);
};

demandeSejourStore.getEigs(route.params.declarationId);
</script>
