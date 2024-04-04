<template>
  <div class="detail-container">
    <h1>Déclaration : {{ demandeStore.currentDemande.libelle }}</h1>
    <div class="fr-grid-row">
      <div class="fr-col-7">
        <div v-for="detail in demandeDetails" :key="detail.name">
          <strong>{{ detail.name }} : </strong>{{ detail.value }}
        </div>
      </div>
      <div class="fr-col-5 badge">
        <DemandeStatusBadge
          :statut="demandeStore.currentDemande.statut"
          :small="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";

const demandeStore = useDemandeSejourStore();

const demandeDetails = computed(() => [
  {
    name: "Organisme",
    value: demandesSejours.getOrganismeTitle(demandeStore.currentDemande),
  },
  {
    name: "Date (début / fin)",
    value: demandesSejours.getDateDebutFin(demandeStore.currentDemande),
  },
  {
    name: "Saison",
    value: demandesSejours.getSaison(demandeStore.currentDemande),
  },
  {
    name: "Déclaration",
    value: demandesSejours.isDeclaration8Jours(
      demandeStore.currentDemande.statut,
    )
      ? "Demande à 8 jours"
      : "Demande a 2 mois",
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

.badge {
  display: flex;
  justify-content: end;
  align-items: start;
}
</style>
