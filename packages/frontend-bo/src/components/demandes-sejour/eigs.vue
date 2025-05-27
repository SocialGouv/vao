<template>
  <DsfrAccordionsGroup
    v-model="expandedIndex"
    @update:model-value="openModal(expandedIndex)"
  >
    <DsfrAccordion
      v-for="eig in props.eigs"
      :id="eig.id"
      :key="eig.id"
      :title="getTitle(eig)"
    >
      <EigSynthese
        v-if="eigStore.currentEig"
        :eig="eigStore.currentEig"
        :file="eigStore.currentEig?.file"
        :cdn-url="`${config.public.backendUrl}/documents/admin/`"
        @update:file="file"
      />
    </DsfrAccordion>
  </DsfrAccordionsGroup>
  <ValidationModal
    modal-ref="modal-eig-list-consult"
    name="consult-eig"
    :opened="modalDetails != null"
    title="Consultation d’un EIG"
    :on-close="closeEigModal"
    :on-validate="() => readEig()"
    >Vous vous apprêtez à consulter une déclaration d’un Evènement Indésirable
    Grave. Cette consultation enverra un email de notification à l’organisme.
  </ValidationModal>
</template>

<script setup>
import { ValidationModal } from "@vao/shared";
import dayjs from "dayjs";

const toaster = useToaster();

const props = defineProps({
  eigs: { type: Array, default: () => [] },
});

const emits = defineEmits(["getEigs"]);

const eigStore = useEigStore();
const userStore = useUserStore();
const config = useRuntimeConfig();

const getTitle = (eig) =>
  `EIG ${eig.id} déposé le ${dayjs(eig.dateDepot).format("DD/MM/YYYY")} / statut : ${eig.readByDreets && eig.readByDdets ? "LU" : "NON LU"}`;

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

  if (utilsEig.mustMarkAsRead(eig, userStore.user)) {
    expandedIndex.value = -1;
    modalDetails.value = { eigId: eig.id, index };
  } else {
    await eigStore.setCurrentEig(eig.id);
  }
};
const closeEigModal = () => (modalDetails.value = null);
</script>

<style scoped></style>
