<template>
  <div>
    <div>sejours</div>
    <pre>{{ sejourStore.demandes }}</pre>
  </div>
</template>

<script setup>
import { useDemandeSejourStore } from "~/stores/demande-sejour";

const sejourStore = useDemandeSejourStore();

onMounted(() => {
  sejourStore.fetchDemandes();
});

onUpdated(() => console.log(sejourStore.demandes));
</script>
