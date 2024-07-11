<template>
  <div class="fr-col-7">
    <div v-for="detail in currentEigValues" :key="detail.label">
      <strong>{{ detail.label }} : </strong
      ><span v-if="typeof detail.value === 'string'">{{ detail.value }}</span>
      <div v-if="Array.isArray(detail.value)">
        <ul>
          <li v-for="item in detail.value" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from "dayjs";

const eigStore = useEigStore();

const currentEigValues = computed(() => [
  {
    label: "Déclaration",
    value: eigStore.currentEig?.idFonctionnelle ?? "",
  },
  {
    label: "Séjour",
    value: eigStore.currentEig?.libelle ?? "",
  },
  {
    label: "Organisme",
    value:
      eigStore.currentEig.raisonSociale ??
      `${eigStore.currentEig?.prenom} ${eigStore.currentEig?.nom}`,
  },
  {
    label: "Date (début / fin)",
    value:
      eigStore.currentEig.dateDebut && eigStore.currentEig.dateFin
        ? `${dayjs(eigStore.currentEig.dateDebut).format("DD/MM/YYYY")} - ${dayjs(eigStore.currentEig.dateFin).format("DD/MM/YYYY")}`
        : "",
  },
  {
    label: "Saison",
    value: eigStore.currentEig?.saison ?? "",
  },
  {
    label: "Adresse du / des lieux de séjour",
    value: eigStore.currentEig?.adresses ?? [],
  },
  {
    label: "type d'événements",
    value:
      eigStore.currentEig?.types?.map(
        (t) =>
          eig.mapEigToLabel[t.type] + (t.precision ? " : " + t.precision : ""),
      ) ?? [],
  },
]);
</script>

<style scoped lang="scss"></style>
