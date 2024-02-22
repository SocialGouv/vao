<template>
  <div class="detail-container">
    <h1>Demande : {{ demande.libelle }}</h1>
    <div v-for="detail in demandeDetails" :key="detail.name">
      <strong>{{ detail.name }} : </strong>{{ detail.value }}
    </div>
  </div>
</template>

<script setup>
import { formatDate } from "date-fns/format";
import { isDemande8Jours } from "~/utils/demande-sejour/statuts";

const route = useRoute();
const demandeStore = useDemandeSejourStore();

const demande = demandeStore.getById(route.params.idDemande);
const demandeDetails = computed(() => [
  {
    name: "Organisme",
    value: demandeStore.organismeTitle(demande.demandeSejourId),
  },
  {
    name: "Date (debut / fin)",
    value: `${formatDate(demande.dateDebut, "dd/MM/yyyy")} - ${formatDate(demande.dateFin, "dd/MM/yyyy")}`,
  },
  { name: "Saison", value: demandeStore.saison(demande.demandeSejourId) },
  {
    name: "Déclaration",
    value: isDemande8Jours(demande.statut)
      ? "Demande à 8 jours"
      : "Demande à 2 mois",
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
