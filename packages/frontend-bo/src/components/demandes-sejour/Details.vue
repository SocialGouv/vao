<template>
  <div class="detail-container">
    <h1>Demande : {{ demande.libelle }}</h1>
    <div class="fr-grid-row">
      <div class="fr-col-10">
        <div v-for="detail in demandeDetails" :key="detail.name">
          <strong>{{ detail.name }} : </strong>{{ detail.value }}
        </div>
      </div>
      <div class="fr-col-2">
        <DemandeStatusBadge :statut="demande.statut" :small="false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";

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
