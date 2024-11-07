<template>
  <div>
    <h1 class="header">
      Déclarations à Traiter ({{
        (sejourStore.stats?.transmis ?? 0) +
        (sejourStore.stats?.enCours ?? 0) +
        (sejourStore.stats?.transmis8J ?? 0)
      }})
    </h1>
    <CardsNumber :values="cards" @click="onClickCards" />
    <DemandesSejourDefaultTable />
  </div>
</template>

<script setup>
import { CardsNumber } from "@vao/shared";
definePageMeta({
  middleware: ["is-connected", "check-role"],
  roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
});

const sejourStore = useDemandeSejourStore();

const statuts = ref(null);

const cards = computed(() => [
  {
    title: "Déclarations reçues à traiter",
    value: sejourStore.stats?.transmis || 0,
    clickable: true,
    onClick: () => onStatutSelect([demandesSejours.statuts.TRANSMISE]),
  },
  {
    title: "Déclarations en cours de traitement",
    value: sejourStore.stats?.enCours || 0,
    clickable: true,
    onClick: () =>
      onStatutSelect([
        demandesSejours.statuts.EN_COURS,
        demandesSejours.statuts.EN_COURS_8J,
      ]),
  },
  {
    title: "Déclarations 8 jours à traiter",
    value: sejourStore.stats?.transmis8J || 0,
    clickable: true,
    onClick: () => onStatutSelect([demandesSejours.statuts.TRANSMISE_8J]),
  },
]);

const onStatutSelect = (value) => {
  if (value.length) {
    statuts.value = value;
  } else {
    statuts.value = null;
  }
};

const onClickCards = (title) => {
  cards.value.find((c) => c.title === title)?.onClick();
};
</script>

<style scoped>
.header {
  padding: 1em 0em;
}
</style>
