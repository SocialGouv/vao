<template>
  <div class="fr-container fr-pt-8v">
    <fieldset v-if="eigs && eigs.length > 0" class="fr-fieldset">
      <UtilsTableFull :headers="headers" :data="eigs" @click-row="navigate" />
    </fieldset>
    <p v-else>Aucun Eig déclaré actuellement</p>
    <fieldset v-if="eig.isDeclarationligibleToEig(ds)" class="fr-fieldset">
      <DsfrButton>
        <NuxtLink :to="`/eig${ds.id != null ? '?dsId=' + ds.id : ''}`">
          Déclarer un EIG
        </NuxtLink>
      </DsfrButton>
    </fieldset>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import EigStatusBadge from "~/components/EIG/EigStatusBadge.vue";

const props = defineProps({
  eigs: { type: Array, default: () => [] },
  ds: {
    type: Object,
    default: () => {},
  },
});

const headers = [
  {
    column: "id",
    text: "ID",
    sort: true,
  },
  {
    column: "createdAt",
    text: "Date de déclaration de l’EIG",
    format: (value) => dayjs(value.createdAt).format("DD/MM/YYYY"),
    sort: true,
  },
  {
    column: "libelle",
    text: "Séjour",
    sort: true,
  },
  {
    column: "dateDebut",
    text: "Dates (Début-fin)",
    format: (value) =>
      `${dayjs(value.dateDebut).format("DD/MM/YYYY")} - ${dayjs(value.dateFin).format("DD/MM/YYYY")}`,
    sort: true,
  },
  {
    column: "types",
    text: "Types d'événement",
    format: (value) =>
      (value.types ?? []).map((t) => eig.mapEigToLabel[t]).join(", "),
  },
  {
    column: "statut",
    text: "Statut",
    component: ({ statut }) => ({
      component: EigStatusBadge,
      statut: statut,
    }),
    sort: true,
  },
];

const navigate = (item) => {
  navigateTo(`/eig/${item.id}`);
};
</script>

<style scoped>
p {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
