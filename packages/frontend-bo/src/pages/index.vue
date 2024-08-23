<template>
  <div>
    <h1>Bienvenue {{ user.prenom }} {{ user.nom }}</h1>
    <div>
      <cardsNumber
        :values="[
          {
            title: 'Déclarations transmises à traiter',
            value: stats?.transmis + stats?.enCours,
            redirect: `/sejours?statuts=${demandesSejours.statuts.TRANSMISE},${demandesSejours.statuts.EN_COURS}`,
          },
          {
            title: 'Déclarations 8 jours à traiter',
            value: stats?.transmis8J + stats?.enCours8J,
            redirect: `/sejours?statuts=${demandesSejours.statuts.TRANSMISE_8J},${demandesSejours.statuts.EN_COURS_8J}`,
          },
          {
            title: 'Déclarations 8 jours en attente',
            value: stats?.declaration8J,
            redirect: `/sejours?statuts=${demandesSejours.statuts.ATTENTE_},${demandesSejours.statuts.EN_COURS}`,
          },
        ]"
      />
      <cardsNumber
        :values="[
          {
            title: 'Déclarations finalisées',
            value: stats?.validee8J,
            redirect: `/sejours?statuts=${demandesSejours.statuts.VALIDEE_8J}`,
          },
          {
            title: 'Séjours terminés',
            value: stats?.terminee,
            redirect: `/sejours?statuts=${demandesSejours.statuts.TERMINEE}`,
          },
          {
            title: 'Déclarations non finalisées',
            value: stats?.nonFinalisees,
            redirect: `/sejours?statuts=${demandesSejours.statuts.ANNULEE},${demandesSejours.statuts.ABANDONNEE},${demandesSejours.statuts.REFUSEE},${demandesSejours.statuts.REFUSEE_8J}`,
          },
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { CardsNumber } from "@vao/shared";

definePageMeta({
  layout: "default",
  middleware: ["is-connected"],
});

onMounted(() => {
  document.querySelector("#header").focus();
});

const usersStore = useUserStore();
const user = usersStore.user;
const demandeSejourStore = useDemandeSejourStore();
demandeSejourStore.getStats();

const stats = computed(() => demandeSejourStore.stats);
</script>
