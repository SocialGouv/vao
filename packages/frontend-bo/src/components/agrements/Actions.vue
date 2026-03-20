<template>
  <div v-if="isActionsVisible">
    <DsfrAlert
      class="fr-grid-row fr-alert--sm fr-my-3v"
      :role="'alert'"
      description="Vous devez confirmer la complétude du dossier et fournir un récépissé. Vous pourrez ensuite valider l’agrément et fournir l’arrêté."
      type="info"
      :closeable="false"
    />
    <DsfrModal
      name="modalComplement"
      :opened="isModalComplementOpened"
      title="Demande de compléments"
      size="xl"
      @close="isModalComplementOpened = false"
    >
      <AgrementsDemandeComplements
        :cdn-url="props.cdnUrl"
        @valid="onValidComplement"
        @update:file="fileUpdate"
      />
    </DsfrModal>

    <DsfrButtonGroup :inline-layout-when="true">
      <DsfrButton
        label="Demander des compléments à l'organisateur"
        tertiary
        type="button"
        :disabled="false"
        @click="isModalComplementOpened = true"
      />
      <DsfrButton
        label="Confirmer la complétude du dossier"
        primary
        type="button"
        :disabled="true"
      />
    </DsfrButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { AGREMENT_STATUT, FILE_CATEGORY } from "@vao/shared-bridge";
import { useToaster } from "@vao/shared-ui";
import { useAgrementStore } from "~/stores/agrement";
import { useDocumentStore } from "~/stores/document";
const agrementStore = useAgrementStore();
const documentStore = useDocumentStore();
const file = ref<File | undefined>(undefined);
const fileUpdate = (f: File | undefined) => (file.value = f);

const toaster = useToaster();
const props = defineProps<{
  cdnUrl: string;
}>();

const ALLOWED_STATUTS_ACTIONS = [
  AGREMENT_STATUT.PRIS_EN_CHARGE,
  AGREMENT_STATUT.EN_COURS,
];

const isModalComplementOpened = ref(false);

const isActionsVisible = computed(() =>
  agrementStore.agrementCourant
    ? ALLOWED_STATUTS_ACTIONS.includes(
        agrementStore.agrementCourant.statut as AGREMENT_STATUT,
      )
    : false,
);

const onValidComplement = async (payload: { commentaire: string }) => {
  isModalComplementOpened.value = false;
  if (agrementStore.agrementCourant?.id) {
    try {
      const fileAModifier = await createDocument({
        document: file?.value,
        category: FILE_CATEGORY.AMODIFER,
      });
      await agrementStore.changeStatutAgrement({
        agrementId: agrementStore.agrementCourant.id,
        statut: AGREMENT_STATUT.A_MODIFIER,
        commentaire: payload.commentaire,
        file: fileAModifier,
      });
      toaster.success({
        titleTag: "h2",
        description: `La demande de complétion de l'agrément a été envoyé`,
      });
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  }
};

async function createDocument({
  document,
  category,
}: {
  document: any;
  category: FILE_CATEGORY;
}) {
  if (document && Object.keys(document?.uuid ?? {}).length === 0) {
    try {
      const uuid = await documentStore.postDocument({ document, category });
      toaster.info({
        titleTag: "h2",
        description: `Fichier ${document.name} déposé`,
      });
      return {
        fileUuid: uuid,
        category,
        agrementId: agrementStore.agrementCourant?.id ?? null,
      };
    } catch (error) {
      toaster.error({
        titleTag: "h2",
        description: error instanceof Error ? error.message : String(error),
      });
      return undefined;
    }
  }
}
</script>
