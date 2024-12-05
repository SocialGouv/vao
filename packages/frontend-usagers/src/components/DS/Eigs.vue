<template>
  <div class="fr-container fr-pt-8v">
    <div v-if="eigs && eigs.length > 0" class="fr-fieldset">
      <TableFull :headers="headers" :data="eigs" @click-row="navigate" />
    </div>
    <p v-else>Aucun Eig déclaré actuellement</p>
    <div v-if="eig.isDeclarationligibleToEig(ds)" class="fr-fieldset">
      <DsfrButton>
        <NuxtLink :to="`/eig${ds.id != null ? '?dsId=' + ds.id : ''}`">
          Déclarer un EIG
        </NuxtLink>
      </DsfrButton>
    </div>
    <ValidationModal
      modal-ref="modal-eig-list"
      name="delete-eig"
      :opened="eigToDelete != null"
      title="Suppression d'un EIG ?"
      :on-close="closeEigModal"
      :on-validate="deleteEig"
      >Vous vous apprêtez à supprimer l'EIG : <br />
      - {{ eigToDelete }}
    </ValidationModal>
  </div>
</template>

<script setup>
import dayjs from "dayjs";
import EigStatusBadge from "@vao/shared/src/components/eig/EigStatusBadge.vue";
import { TableFull, ValidationModal } from "@vao/shared";
import { mapEigToLabel } from "@vao/shared/src/utils/eigUtils";

const DsfrButton = resolveComponent("DsfrButton");

const eigStore = useEigStore();

const props = defineProps({
  eigs: { type: Array, default: () => [] },
  ds: {
    type: Object,
    default: () => {},
  },
  fetchEig: { type: Function, required: true },
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
      (value.types ?? []).map((t) => mapEigToLabel[t]).join(", "),
  },
  {
    column: "statut",
    text: "Statut",
    component: ({
      statut,
      readByDreets,
      readByDdets,
      departement,
      agrementRegionObtention,
    }) => ({
      component: EigStatusBadge,
      statut,
      dreets: { isRead: readByDreets, territoireCode: agrementRegionObtention },
      ddets: { isRead: readByDdets, territoireCode: departement },
    }),
    sort: true,
  },
  {
    text: "Actions",
    component: ({ statut, id }) => ({
      component: DsfrButton,
      disabled: !eig.canDelete(statut),
      onClick: (event) => {
        event.stopPropagation();
        eigToDelete.value = id;
      },
      label: "Suppression",
      iconOnly: true,
      icon: "ri:delete-bin-2-line",
    }),
  },
];

const navigate = (item) => {
  navigateTo(`/eig/${item.id}`);
};

const eigToDelete = ref(null);

const closeEigModal = () => (eigToDelete.value = null);
const deleteEig = async () => {
  try {
    await eigStore.delete(eigToDelete.value);
    await props.fetchEig();
  } catch (error) {
    toaster.error("Une erreur est survenue de la suppression de l'EIG");
    throw error;
  } finally {
    closeEigModal();
  }
};
</script>

<style scoped>
p {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
