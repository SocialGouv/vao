<template>
  <DsfrAccordionsGroup
    v-model="expandedIndex"
    @update:model-value="openModal(expandedIndex)"
  >
    <DsfrAccordion
      v-for="eig in eigs"
      :id="eig.id"
      :key="eig.id"
      :title="getTitle(props.eig)"
    >
      <EigSynthese v-if="eigStore.currentEig" :eig="eigStore.currentEig" />
    </DsfrAccordion>
  </DsfrAccordionsGroup>
  <ValidationModal
    modal-ref="modal-eig-list-consult"
    name="consult-eig"
    :opened="modalDetails != null"
    title="Consultation d’un EIG"
    :on-close="closeEigModal"
    :on-validate="() => readEig()"
    >Vous vous apprêtez à consulter un Evènement Indésirable Grave. Cette
    consultation enverra un email de notification à l’organisme.
  </ValidationModal>
</template>

<script setup>
import { eigModel, ValidationModal } from "@vao/shared";
import dayjs from "dayjs";

const props = defineProps({
  eigs: { type: Array, default: () => [] },
});

const emits = defineEmits(["getEigs"]);

const eigStore = useEigStore();

const getTitle = (eig) =>
  `EIG ${eig.id} déposé le ${dayjs(eig.dateDepot).format("DD/MM/YYYY")} / statut : ${eig.statut}`;

const expandedIndex = ref(-1);

const modalDetails = ref(null);

const readEig = async () => {
  try {
    await eigStore.markAsRead(modalDetails.value.eigId);
    expandedIndex.value = modalDetails.value.index;
    emits("getEigs");
    await eigStore.setCurrentEig(modalDetails.value.eigId);
    closeEigModal();
  } catch (error) {
    toaster.error("Une erreur est survenue lors de la lecture de l'eig");
    throw error;
  }
};

const openModal = async (index) => {
  const eig = props.eigs[index];
  if (!eig) {
    return;
  }

  if (eig.statut === eigModel.Statuts.ENVOYE) {
    expandedIndex.value = -1;
    modalDetails.value = { eigId: eig.id, index };
  } else {
    await eigStore.setCurrentEig(eig.id);
  }
};
const closeEigModal = () => (modalDetails.value = null);
</script>

<style scoped></style>
