<template>
  <DemandesSejourDocuments
    v-if="isCurrentDemandeIsAvailable"
    :declaration="currentDemande"
    :messages="messages ?? []"
  />
</template>

<script setup>
const route = useRoute();
const demandeSejourStore = useDemandeSejourStore();

demandeSejourStore.fetchMessages(route.params.declarationId);

const currentDemande = computed(() => demandeSejourStore.currentDemande);
const messages = computed(() => demandeSejourStore.messages);

const isCurrentDemandeIsAvailable = computed(() => {
  return (
    demandeSejourStore.currentDemande?.declarationId ===
    parseInt(route.params.declarationId, 10)
  );
});
</script>
