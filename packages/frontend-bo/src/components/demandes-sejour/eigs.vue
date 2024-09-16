<template>
  <DsfrAccordionsGroup
    v-model="expandedIndex"
    @update:model-value="openModal(eigs[expandedIndex])"
  >
    <DsfrAccordion
      v-for="eig in eigs"
      :id="eig.id"
      :key="eig.id"
      :title="getTitle(eig)"
    >
      <EigSynthese v-if="eigStore.currentEig" :eig="eigStore.currentEig" />
    </DsfrAccordion>
  </DsfrAccordionsGroup>
  <ValidationModal
    modal-ref="modal-eig-list-consult"
    name="consult-eig"
    :opened="eigToRead != null"
    title="Consultation d’un EIG"
    :on-close="closeEigModal"
    :on-validate="() => readEig(eigToRead)"
    >Vous vous apprêtez à consulter un Evènement Indésirable Grave. Cette
    consultation enverra un email de notification à l’organisme.
  </ValidationModal>
</template>

<script setup>
import { eigModel, ValidationModal } from "@vao/shared";
import dayjs from "dayjs";

const props = defineProps({
  eigs: { type: Array, default: () => [] },
  fetchEig: { type: Function, required: true },
});

const eigStore = useEigStore();

const getTitle = (eig) =>
  `EIG ${eig.id} déposé le ${dayjs(eig.dateDepot).format("DD/MM/YYYY")} / statut : ${eig.statut}`;

const expandedIndex = ref(-1);

const eigToRead = ref(null);

const readEig = async (id) => {
  try {
    await eigStore.markAsRead(id);
    expandedId.value = id;
    await props.fetchEig();
    await eigStore.setCurrentEig(id);
    closeEigModal();
  } catch (e) {
    toaster.error("Une erreur est survenue lors de la lecture de l'eig");
  }
};

const openModal = async (eig) => {
  if (eig.statut === eigModel.Statuts.ENVOYE) {
    eigToRead.value = eig.id;
  } else {
    expandedId.value = eig.id;
    await eigStore.setCurrentEig(eig.id);
  }
};
const closeEigModal = () => (eigToRead.value = null);
</script>

<style scoped></style>
