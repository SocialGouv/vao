<template>
  <div class="detail-container">
    <h1>Demande : {{ demande.libelle }}</h1>
    <div v-for="detail in demandeDetails" :key="detail.name">
      <strong>{{ detail.name }} : </strong>{{ detail.value }}
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const demandeStore = useDemandeSejourStore();

const demande = demandeStore.getById(route.params.idDemande);
const demandeDetails = computed(() => [
  {
    name: "Organisme",
    value: demandesSejours.getOrganismeTitle(demande),
  },
  {
    name: "Date (début / fin)",
    value: demandesSejours.getDateDebutFin(demande),
  },
  { name: "Saison", value: demandesSejours.getSaison(demande) },
  {
    name: "Déclaration",
    value: "TO DO : indiquer demande à 8 jours",
  },
  {
    name: "Statut",
    value: demande.statut,
  },
]);
</script>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  padding: 0em 1em;
  margin-bottom: 2em;
}
</style>
