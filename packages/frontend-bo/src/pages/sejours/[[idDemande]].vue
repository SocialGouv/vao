<template>
  <pre>
    {{ demandeStore.getById(route.params.idDemande) }}
  </pre>
</template>

<script setup>
const route = useRoute();
const demandeStore = useDemandeSejourStore();
</script>
