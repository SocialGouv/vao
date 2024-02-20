<template>
  <div>
    <div>sejours</div>
    <UtilsTableFull
      :headers="headers"
      :data="sejourStore.demandes"
      :row-navigate="navigate"
    ></UtilsTableFull>
    <!--      :search="search"-->
    <pre>{{ sejourStore.demandes }}</pre>
  </div>
</template>

<script setup>
import { useDemandeSejourStore } from "~/stores/demande-sejour";
import { formatDate } from "date-fns/format";
import { demandeStatusSejour } from "~/utils/demandes-sejour/enum";
import DemandeStatusBadge from "~/components/demandes-sejour/DemandeStatusBadge.vue";

const sejourStore = useDemandeSejourStore();

onMounted(() => {
  sejourStore.fetchDemandes();
});

const headers = [
  {
    column: "libelle",
    sorter: "demandeSejourLibelle",
    text: "Identifiant Séjour",
  },
  {
    sorter: "demandeSejourLibelle",
    text: "Dates (Début-fin)",
    format: (value) =>
      `${formatDate(value.dateDebut, "dd/MM/yyyy")} - ${formatDate(value.dateFin, "dd/MM/yyyy")}`,
  },
  {
    column: "demandeSejourSaison",
    sorter: "demandeSejourSaison",
    text: "Saison",
    format: (value) => sejourStore.saison(value.id),
  },
  {
    column: "demandeSejourOrganisme",
    sorter: "demandeSejourOrganisme",
    text: "Organisme",
    format: (value) => sejourStore.organismeTitle(value.id),
  },
  {
    column: "demandeSejourstatut",
    sorter: "demandeSejourstatut",
    text: "statut",
    component: ({ statut }) => ({
      component: DemandeStatusBadge,
      statut: statut,
    }),
  },
];

console.log(demandeStatusSejour);

const navigate = () => console.log("toto");
</script>

<style>
tr.pointer {
  cursor: pointer;
}

th.pointer {
  color: #959292;
}
</style>
