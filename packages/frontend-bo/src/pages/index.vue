<template>
  <div>
    <h1>Bienvenue {{ user.prenom }} {{ user.nom }}</h1>
    <div>
      <CardsNumber :values="topCards" />
      <CardsNumber :values="bottomCards" />
    </div>
  </div>
</template>

<script setup>
import { CardsNumber } from "@vao/shared-ui";
import { watchEffect } from "vue";

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

watchEffect(() => {
  const roles = usersStore.user?.roles ?? [];
  if (roles.includes("eig")) {
    const eigStore = useEigStore();
    eigStore.getTotalEigToRead();
  }
});

const stats = computed(() => demandeSejourStore.stats);

const formatHtmlTitle = (elements) =>
  elements
    .map(
      ([label, count]) => `- ${label}: ${count} demande${count > 1 ? "s" : ""}`,
    )
    .join("\n");

const topCards = computed(() => [
  {
    title: "Déclarations reçues à traiter",
    value: stats.value?.transmis + stats.value?.enCours || 0,
    redirect: `/sejours?statuts=${demandesSejours.statuts.TRANSMISE},${demandesSejours.statuts.EN_COURS}`,
    htmlTitle: formatHtmlTitle([
      [demandesSejours.statuts.TRANSMISE, stats.value?.transmis],
      [demandesSejours.statuts.EN_COURS, stats.value?.enCours],
    ]),
  },
  {
    title: "Déclarations 8 jours à traiter",
    value: stats.value?.transmis8J + stats.value?.enCours8J || 0,
    redirect: `/sejours?statuts=${demandesSejours.statuts.TRANSMISE_8J},${demandesSejours.statuts.EN_COURS_8J}`,
    htmlTitle: formatHtmlTitle([
      [demandesSejours.statuts.TRANSMISE_8J, stats.value?.transmis8J],
      [demandesSejours.statuts.EN_COURS_8J, stats.value?.enCours8J],
    ]),
  },
  {
    title: "Déclarations 8 jours en attente",
    value: stats.value?.declaration8J || 0,
    redirect: `/sejours?statuts=${demandesSejours.statuts.ATTENTE_8_JOUR}`,
    htmlTitle: formatHtmlTitle([
      [demandesSejours.statuts.ATTENTE_8_JOUR, stats.value?.declaration8J],
    ]),
  },
]);

const bottomCards = computed(() => [
  {
    title: "Déclarations finalisées",
    value: stats.value?.validee8J || 0,
    redirect: `/sejours?statuts=${demandesSejours.statuts.VALIDEE_8J}`,
    htmlTitle: formatHtmlTitle([
      [demandesSejours.statuts.VALIDEE_8J, stats.value?.validee8J],
    ]),
  },
  {
    title: "Séjours terminés",
    value: stats.value?.terminee || 0,
    redirect: `/sejours?statuts=${demandesSejours.statuts.TERMINEE}`,
    htmlTitle: formatHtmlTitle([
      [demandesSejours.statuts.TERMINEE, stats.value?.terminee],
    ]),
  },
  {
    title: "Déclarations non finalisées",
    value:
      stats.value?.annulee +
        stats.value?.abandonnee +
        stats.value?.refusee +
        stats.value?.refuse8J || 0,
    redirect: `/sejours?statuts=${demandesSejours.statuts.ANNULEE},${demandesSejours.statuts.ABANDONNEE},${demandesSejours.statuts.REFUSEE},${demandesSejours.statuts.REFUSEE_8J}`,
    htmlTitle: formatHtmlTitle([
      [demandesSejours.statuts.ANNULEE, stats.value?.annulee],
      [demandesSejours.statuts.ABANDONNEE, stats.value?.abandonnee],
      [demandesSejours.statuts.REFUSEE, stats.value?.refusee],
      [demandesSejours.statuts.REFUSEE_8J, stats.value?.refuse8J],
    ]),
  },
]);
</script>
