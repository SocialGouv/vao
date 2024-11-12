<template>
  <DemandesSejourHistorique v-if="history" :historique="history ?? []" />
</template>

<script setup>
const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();

const history = computed(() => demandeSejourStore.history);

demandeSejourStore.getHistory(route.params.declarationId);
</script>
