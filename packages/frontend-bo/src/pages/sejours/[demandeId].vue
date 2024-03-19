<template>
  <pre>
    {{ demandeStore.getById(route.params.demandeId) }}
  </pre>
</template>

<script setup>
definePageMeta({
  middleware: ["is-connected"],
});

const route = useRoute();
const demandeStore = useDemandeSejourStore();
</script>
