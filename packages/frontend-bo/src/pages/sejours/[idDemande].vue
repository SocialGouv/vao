<template>
  <pre>
    {{ demandeStore.getById(route.params.demandeId) }}
  </pre>
</template>

<script setup>
const route = useRoute();
const demandeStore = useDemandeSejourStore();
</script>
